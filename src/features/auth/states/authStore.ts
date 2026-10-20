import { writable } from "svelte/store";
import authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

export const isAuthLogin = writable<boolean>(false);
export const isAuthRegister = writable<boolean>(false);

export function setIsAuthLogin(value: boolean) {
  isAuthLogin.set(value);
}

export function setIsAuthRegister(value: boolean) {
  isAuthRegister.set(value);
}

export async function asyncSetIsAuthRegister(
  name: string,
  email: string,
  password: string
) {
  try {
    const res = await authApi.postRegister(name, email, password);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isAuthRegister.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal mendaftar");
    return false;
  }
}

export async function asyncSetIsAuthLogin(email: string, password: string) {
  try {
    const res = await authApi.postLogin(email, password);
    if (res.status === "success" && res.data?.token) {
      putAccessToken(res.data.token);
      isAuthLogin.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal masuk");
    return false;
  }
}

export function asyncUnsetIsAuthLogin() {
  removeAccessToken();
  isAuthLogin.set(false);
}
