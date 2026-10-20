import { fetchWithAuth } from "../../../helpers/apiHelper";

export async function postRegister(name: string, email: string, password: string) {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
}

export async function postLogin(email: string, password: string) {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

export default {
  postRegister,
  postLogin,
};
