const configuredApiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://restohubapi.duckdns.org/api";

export const API_BASE_URL = configuredApiUrl.replace(/\/$/, "");
export const APP_NAME = "RestoHub";

export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  OWNER: "owner",
  WAITER: "waiter",
  CHEF: "chef",
};

export const ROLE_LABELS = {
  [ROLES.PLATFORM_ADMIN]: "Platform admin",
  [ROLES.OWNER]: "Owner",
  [ROLES.WAITER]: "Waiter",
  [ROLES.CHEF]: "Chef",
};

export const ORDER_STATUSES = ["pending", "preparing", "ready", "served", "cancelled"];

