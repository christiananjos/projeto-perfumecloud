const DEFAULT_API_URL =
  "https://marketplacemanagement-hzhygwdfaxfnbnga.brazilsouth-01.azurewebsites.net";
const API_URL = (window.API_URL || DEFAULT_API_URL).replace(/\/$/, "");
const AUTH_TOKEN_KEY = "apiToken";
const AUTH_SESSION_KEY = "apiSession";
const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const MOJIBAKE_REPLACEMENTS = new Map([
  ["Estrat�gia", "Estratégia"],
  ["An�lise", "Análise"],
  ["relat�rio", "relatório"],
  ["relat�rios", "relatórios"],
  ["F�sico", "Físico"],
  ["Preju�zo", "Prejuízo"],
  ["Cr�tico", "Crítico"],
  ["Saud�veis", "Saudáveis"],
  ["Execu��o", "Execução"],
  ["A��o", "Ação"],
  ["an�lise", "análise"],
  ["� Mercado Livre", "• Mercado Livre"],
  [" � ", " - "],
  ["�", "-"],
]);

function getToken() {
  return window.apiToken || localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function normalizeRole(role) {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();
  return normalized || "vendedor";
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
      role: normalizeRole(claims.role || claims[ROLE_CLAIM] || "admin"),
      exp: claims.exp || null,
      token,
    };
  } catch {
    return null;
  }
}

function normalizeText(value) {
  if (typeof value !== "string") return value;

  let normalized = value;
  for (const [from, to] of MOJIBAKE_REPLACEMENTS.entries()) {
    normalized = normalized.split(from).join(to);
  }

  return normalized;
}

function normalizeData(value) {
  if (typeof value === "string") return normalizeText(value);
  if (Array.isArray(value)) return value.map(normalizeData);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        normalizeData(entryValue),
      ]),
    );
  }
  return value;
}

function safeParseJson(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
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
  const data = safeParseJson(responseText);

  if (res.status === 401) {
    clearAuth();
    throw new Error(
      data?.mensagem ||
        data?.title ||
        "Sessão expirada ou token da API inválido",
    );
  }

  const normalizedData = normalizeData(data);

  if (!res.ok) {
    throw new Error(
      normalizedData?.mensagem ||
        normalizedData?.title ||
        `Erro ${res.status} ao acessar a API`,
    );
  }

  return normalizedData;
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
  const data = safeParseJson(responseText);
  if (!data?.token) return data;

  return {
    ...normalizeData(data),
    session: buildSessionFromToken(data.token),
  };
}
