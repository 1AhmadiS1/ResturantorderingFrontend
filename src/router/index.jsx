import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { ROLES } from "../config";
import { RestaurantWorkspaceGuard } from "../features/restaurants/RestaurantWorkspaceGuard";
import { LoadingState } from "../shared/components/StateView";
import { RequireAuth, RequireRole } from "./guards";
import RouteErrorPage from "./RouteErrorPage";

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
  { path: "/login", element: suspense(<LoginPage />), errorElement: <RouteErrorPage /> },
  { element: <RequireAuth />, errorElement: <RouteErrorPage />, children: [{ element: <AppShell />, children: [
    { index: true, element: suspense(<RoleHome />) },
    { element: <RequireRole roles={[ROLES.OWNER]} />, children: [{ path: "dashboard", element: suspense(<DashboardPage />) }] },
    { element: <RequireRole roles={[ROLES.OWNER, ROLES.WAITER]} />, children: [{ path: "orders", element: suspense(<OrdersPage />) }] },
    { element: <RequireRole roles={[ROLES.OWNER, ROLES.CHEF]} />, children: [{ path: "kitchen", element: suspense(<KitchenPage />) }] },
    { element: <RequireRole roles={[ROLES.OWNER, ROLES.WAITER, ROLES.CHEF]} />, children: [{ path: "menu", element: suspense(<MenuPage />) }] },
    { element: <RequireRole roles={[ROLES.OWNER, ROLES.WAITER]} />, children: [{ path: "tables", element: suspense(<TablesPage />) }] },
    { element: <RequireRole roles={[ROLES.OWNER]} />, children: [{ path: "staff", element: suspense(<StaffPage />) }] },
    { element: <RequireRole roles={[ROLES.PLATFORM_ADMIN, ROLES.OWNER]} />, children: [{ path: "restaurants", element: suspense(<RestaurantsPage />) }] },
    { element: <RequireRole roles={[ROLES.PLATFORM_ADMIN]} />, children: [
      { path: "restaurants/:restaurantId", element: <RestaurantWorkspaceGuard />, children: [
        { path: "dashboard", element: suspense(<DashboardPage />) },
        { path: "orders", element: suspense(<OrdersPage />) },
        { path: "kitchen", element: suspense(<KitchenPage />) },
        { path: "menu", element: suspense(<MenuPage />) },
        { path: "tables", element: suspense(<TablesPage />) },
        { path: "staff", element: suspense(<StaffPage />) },
      ] },
    ] },
    { path: "settings", element: suspense(<SettingsPage />) },
    { path: "*", element: suspense(<NotFoundPage />) },
  ] }] },
]);
