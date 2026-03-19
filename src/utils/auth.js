export const ACCESS_TOKEN_KEY = "accessToken";

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function decodeMockToken(token) {
  if (!token) return null;
  if (token === "mock.admin.token") {
    return { role: "admin", fullName: "System Admin", email: "admin@healthhub.com" };
  }
  return null;
}

export function isAdminAuthenticated() {
  const token = getAccessToken();
  const payload = decodeMockToken(token);
  return payload?.role === "admin";
}
