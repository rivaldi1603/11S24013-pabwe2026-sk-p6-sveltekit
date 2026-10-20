const ACCESS_TOKEN_KEY = "accessToken";

export function putAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, {
    ...options,
    headers,
  });
}

export default {
  putAccessToken,
  getAccessToken,
  removeAccessToken,
  fetchWithAuth,
};
