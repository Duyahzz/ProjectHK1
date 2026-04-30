export const statusClasses = {
  BOOKED: "badge badge-blue",
  PICKED_UP: "badge badge-indigo",
  IN_TRANSIT: "badge badge-amber",
  OUT_FOR_DELIVERY: "badge badge-purple",
  DELIVERED: "badge badge-green",
  CANCELLED: "badge badge-red",
  DELAYED: "badge badge-amber",
  PAID: "badge badge-green",
  UNPAID: "badge badge-red",
  REFUNDED: "badge badge-slate",
  ACTIVE: "badge badge-green",
};

export const formatCurrency = (value) => new Intl.NumberFormat().format(Number(value || 0));
