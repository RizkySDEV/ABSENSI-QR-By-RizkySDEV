const API_BASE = "/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
}

export const authApi = {
  login: (credentials: any) => apiFetch("/login", { method: "POST", body: JSON.stringify(credentials) }),
};

export const dashboardApi = {
  getStats: () => apiFetch("/stats"),
};

export const participantsApi = {
  getAll: () => apiFetch("/participants"),
  create: (data: any) => apiFetch("/participants", { method: "POST", body: JSON.stringify(data) }),
  confirm: (id: string) => apiFetch(`/participants/${id}/confirm`, { method: "PATCH" }),
};

export const attendanceApi = {
  scan: (qrCode: string) => apiFetch("/attendance/scan", { method: "POST", body: JSON.stringify({ qrCode }) }),
  getAll: () => apiFetch("/attendance"),
};
