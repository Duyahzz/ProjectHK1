const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
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

  getCustomers: (search = "") =>
    request(`/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  getBranches: () => request("/branches"),

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
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  createShipment: (payload) =>
    request("/shipments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export default API_URL;