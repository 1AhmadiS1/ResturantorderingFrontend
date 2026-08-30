import { Building2, ChefHat, ClipboardList, LayoutDashboard, Settings, Table2, UtensilsCrossed, Users } from "lucide-react";
import { ROLES } from "../../config";

const all = Object.values(ROLES);

export const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: [ROLES.PLATFORM_ADMIN, ROLES.OWNER], restaurantScoped: true },
  { label: "Orders", to: "/orders", icon: ClipboardList, roles: [ROLES.PLATFORM_ADMIN, ROLES.OWNER, ROLES.WAITER], restaurantScoped: true },
  { label: "Kitchen", to: "/kitchen", icon: ChefHat, roles: [ROLES.PLATFORM_ADMIN, ROLES.OWNER, ROLES.CHEF], restaurantScoped: true },
  { label: "Menu", to: "/menu", icon: UtensilsCrossed, roles: all, restaurantScoped: true },
  { label: "Tables", to: "/tables", icon: Table2, roles: [ROLES.PLATFORM_ADMIN, ROLES.OWNER, ROLES.WAITER], restaurantScoped: true },
  { label: "Staff", to: "/staff", icon: Users, roles: [ROLES.PLATFORM_ADMIN, ROLES.OWNER], restaurantScoped: true },
  { label: "Restaurants", to: "/restaurants", icon: Building2, roles: [ROLES.PLATFORM_ADMIN, ROLES.OWNER] },
  { label: "Settings", to: "/settings", icon: Settings, roles: all },
];
