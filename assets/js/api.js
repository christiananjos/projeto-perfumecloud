const API_URL = window.API_URL || "http://localhost:5298";

function getToken() {
  return window.apiToken || localStorage.getItem("apiToken") || "";
}

function clearToken() {
  window.apiToken = null;
  localStorage.removeItem("apiToken");
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
    clearToken();
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
  return responseText ? JSON.parse(responseText) : null;
}
