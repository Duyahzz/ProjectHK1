const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const err = new Error(data?.message || `Request failed: ${response.status}`);
    err.status = response.status;
    err.validationErrors = data?.errors || {};
    err.serverError = data?.error || "";
    throw err;
  }

  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  resetPasswordByPhone: (payload) =>
    request("/auth/reset-password-by-phone", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getCustomers: (search = "") =>
    request(`/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  createCustomer: (payload) =>
    request("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCustomer: (id, payload) =>
    request(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteCustomer: (id) =>
    request(`/customers/${id}`, {
      method: "DELETE",
    }),

  getBranches: () => request("/branches"),

  createBranch: (payload) =>
    request("/branches", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateBranchStatus: (id, payload) =>
    request(`/branches/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getShipmentTypes: () => request("/shipment-types"),

  getShipments: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    ).toString();

    return request(`/shipments${query ? `?${query}` : ""}`);
  },

  getBills: () => request("/bills"),

  trackShipment: (tracking) => request(`/tracking/${tracking}`),

  updateShipmentStatus: (id, payload) =>
    request(`/shipments/${id}/status`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createShipment: (payload) =>
    request("/shipments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export default API_URL;