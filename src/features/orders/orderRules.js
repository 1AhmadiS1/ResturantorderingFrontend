export const statusTransitions = {
  pending: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "cancelled"],
  served: [],
  cancelled: [],
};

export function allowedTransitions(status, role) {
  const available = statusTransitions[status] || [];
  if (["platform_admin", "owner"].includes(role)) return available;
  if (role === "chef") return available.filter((next) => (status === "pending" && next === "preparing") || (status === "preparing" && next === "ready"));
  if (role === "waiter") return available.filter((next) => (status === "pending" && next === "cancelled") || (status === "ready" && next === "served"));
  return [];
}

