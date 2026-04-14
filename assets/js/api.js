const API_URL = window.API_URL || "http://localhost:5298";
const AUTH_TOKEN_KEY = "apiToken";
const AUTH_SESSION_KEY = "apiSession";
const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function getToken() {
  return window.apiToken || localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  return atob(padded);
}

function buildSessionFromToken(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const claims = JSON.parse(decodeBase64Url(payload));
    return {
      email: claims.email || claims[EMAIL_CLAIM] || "",
      role: claims.role || claims[ROLE_CLAIM] || "Admin",
      exp: claims.exp || null,
      token,
    };
  } catch {
    return null;
  }
}

export function persistAuth(token) {
  const session = buildSessionFromToken(token);
  window.apiToken = token;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (session) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function getStoredSession() {
  const token = getToken();
  if (!token) return null;

  const cachedSession = localStorage.getItem(AUTH_SESSION_KEY);
  if (cachedSession) {
    try {
      return JSON.parse(cachedSession);
    } catch {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }

  const session = buildSessionFromToken(token);
  if (session) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearAuth() {
  window.apiToken = null;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_SESSION_KEY);
}

async function api(method, endpoint, body = null, isFormData = false) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  });

  if (res.status === 204) return null;

  const responseText = await res.text();
  const data = responseText ? JSON.parse(responseText) : null;

  if (res.status === 401) {
    clearAuth();
    throw new Error(
      data?.mensagem ||
        data?.title ||
        "Sessao expirada ou token da API invalido",
    );
  }

  if (!res.ok) throw new Error(data?.mensagem || data?.title || "Erro na API");
  return data;
}

export const apiGet = (endpoint) => api("GET", endpoint);
export const apiPost = (endpoint, body) => api("POST", endpoint, body);
export const apiPut = (endpoint, body) => api("PUT", endpoint, body);
export const apiPatch = (endpoint, body) => api("PATCH", endpoint, body);
export const apiDelete = (endpoint) => api("DELETE", endpoint);
export const apiUpload = (endpoint, form) => api("POST", endpoint, form, true);

export async function loginApi(email, senha) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) return null;

  const responseText = await res.text();
  const data = responseText ? JSON.parse(responseText) : null;
  if (!data?.token) return data;

  return {
    ...data,
    session: buildSessionFromToken(data.token),
  };
}
