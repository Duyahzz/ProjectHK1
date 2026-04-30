const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
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

export async function createShipment(payload) {
  return request("/shipments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export default API_URL;