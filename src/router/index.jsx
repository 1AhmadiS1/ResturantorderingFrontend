import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { ROLES } from "../config";
import { LoadingState } from "../shared/components/StateView";
import { RequireAuth, RequireRole } from "./guards";

const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const RoleHome = lazy(() => import("./RoleHome"));
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
const OrdersPage = lazy(() => import("../features/orders/OrdersPage"));
const KitchenPage = lazy(() => import("../features/kitchen/KitchenPage"));
const MenuPage = lazy(() => import("../features/menu/MenuPage"));
const TablesPage = lazy(() => import("../features/tables/TablesPage"));
const StaffPage = lazy(() => import("../features/staff/StaffPage"));
const RestaurantsPage = lazy(() => import("../features/restaurants/RestaurantsPage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));
const NotFoundPage = lazy(() => import("./NotFoundPage"));
const suspense = (element) => <Suspense fallback={<div className="route-loader"><LoadingState /></div>}>{element}</Suspense>;

export const router = createBrowserRouter([
  { path: "/login", element: suspense(<LoginPage />) },
  { element: <RequireAuth />, children: [{ element: <AppShell />, children: [
    { index: true, element: suspense(<RoleHome />) },
    { element: <RequireRole roles={[ROLES.PLATFORM_ADMIN, ROLES.OWNER]} />, children: [{ path: "dashboard", element: suspense(<DashboardPage />) }] },
    { element: <RequireRole roles={[ROLES.PLATFORM_ADMIN, ROLES.OWNER, ROLES.WAITER]} />, children: [{ path: "orders", element: suspense(<OrdersPage />) }] },
    { element: <RequireRole roles={[ROLES.PLATFORM_ADMIN, ROLES.OWNER, ROLES.CHEF]} />, children: [{ path: "kitchen", element: suspense(<KitchenPage />) }] },
    { path: "menu", element: suspense(<MenuPage />) },
    { element: <RequireRole roles={[ROLES.PLATFORM_ADMIN, ROLES.OWNER, ROLES.WAITER]} />, children: [{ path: "tables", element: suspense(<TablesPage />) }] },
    { element: <RequireRole roles={[ROLES.PLATFORM_ADMIN, ROLES.OWNER]} />, children: [{ path: "staff", element: suspense(<StaffPage />) }, { path: "restaurants", element: suspense(<RestaurantsPage />) }] },
    { path: "settings", element: suspense(<SettingsPage />) },
    { path: "*", element: suspense(<NotFoundPage />) },
  ] }] },
]);

