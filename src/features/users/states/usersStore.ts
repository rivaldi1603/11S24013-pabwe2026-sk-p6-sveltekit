import { writable } from "svelte/store";
import userApi from "../api/userApi";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  photo?: string;
  created_at?: string;
}

export const users = writable<UserProfile[]>([]);
export const profile = writable<UserProfile | null>(null);
export const isProfile = writable<boolean>(false);
export const isChangeProfile = writable<boolean>(false);
export const isChangeProfilePhoto = writable<boolean>(false);
export const isChangeProfilePassword = writable<boolean>(false);

export function setIsProfile(val: boolean) {
  isProfile.set(val);
}

export function setIsChangeProfile(val: boolean) {
  isChangeProfile.set(val);
}

export function setIsChangeProfilePhoto(val: boolean) {
  isChangeProfilePhoto.set(val);
}

export function setIsChangeProfilePassword(val: boolean) {
  isChangeProfilePassword.set(val);
}

export async function asyncSetUsers() {
  try {
    const res = await userApi.getUsers();
    if (res.status === "success") {
      users.set(res.data?.users || []);
      return;
    }
    users.set([]);
  } catch {
    users.set([]);
  }
}

export async function asyncSetProfile() {
  try {
    const res = await userApi.getProfile();
    if (res.status === "success" && res.data?.user) {
      profile.set(res.data.user);
      isProfile.set(true);
      return res.data.user;
    }
    profile.set(null);
    isProfile.set(false);
    return null;
  } catch {
    profile.set(null);
    isProfile.set(false);
    return null;
  }
}

export async function asyncPutProfile(name: string, email: string) {
  try {
    const res = await userApi.putProfile(name, email);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isChangeProfile.set(true);
      await asyncSetProfile();
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal memperbarui profil");
    return false;
  }
}

export async function asyncPostProfilePhoto(photo: File) {
  try {
    const res = await userApi.postProfilePhoto(photo);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isChangeProfilePhoto.set(true);
      await asyncSetProfile();
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal mengunggah foto profil");
    return false;
  }
}

export async function asyncPutProfilePassword(password: string, newPassword: string) {
  try {
    const res = await userApi.putProfilePassword(password, newPassword);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isChangeProfilePassword.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal mengubah kata sandi");
    return false;
  }
}
