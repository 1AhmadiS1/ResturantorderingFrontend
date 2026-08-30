import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../auth/AuthProvider";

export function getRestaurantIdFromPath(pathname) {
  const match = pathname.match(/^\/restaurants\/(\d+)(?:\/|$)/);
  return match ? Number(match[1]) : null;
}

export function restaurantWorkspacePath(restaurantId, path = "/dashboard") {
  return restaurantId ? `/restaurants/${restaurantId}${path}` : path;
}

export function useRestaurantScope() {
  const { user } = useAuth();
  const location = useLocation();
  const pathRestaurantId = getRestaurantIdFromPath(location.pathname);
  const restaurantId = user?.role === "platform_admin" ? pathRestaurantId : null;
  const restaurantQuery = useQuery({
    queryKey: ["restaurants", "workspace", restaurantId],
    queryFn: async () => (await apiClient.get(`/restaurants/${restaurantId}/`)).data,
    enabled: Boolean(restaurantId),
  });

  return {
    restaurantId,
    restaurant: restaurantQuery.data || null,
    isRestaurantWorkspace: Boolean(restaurantId),
    restaurantQuery,
  };
}
