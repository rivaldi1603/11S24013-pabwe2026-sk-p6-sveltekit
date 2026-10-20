import { fetchWithAuth } from "../../../helpers/apiHelper";

export async function getUsers() {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/users`);
  return response.json();
}

export async function getProfile() {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/users/me`);
  return response.json();
}

export async function putProfile(name: string, email: string) {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/users/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  return response.json();
}

export async function postProfilePhoto(photo: File) {
  const formData = new FormData();
  formData.append("photo", photo);
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/users/photo`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function putProfilePassword(password: string, new_password: string) {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/users/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, new_password }),
  });
  return response.json();
}

export default {
  getUsers,
  getProfile,
  putProfile,
  postProfilePhoto,
  putProfilePassword,
};
