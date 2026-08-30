import { Navigate, Outlet } from "react-router-dom";
import { ErrorState, LoadingState } from "../../shared/components/StateView";
import { useRestaurantScope } from "./useRestaurantScope";

export function RestaurantWorkspaceGuard() {
  const { restaurantId, restaurantQuery } = useRestaurantScope();

  if (!restaurantId) return <Navigate to="/restaurants" replace />;
  if (restaurantQuery.isLoading) return <LoadingState label="Opening restaurant..." />;
  if (restaurantQuery.isError) return <ErrorState onRetry={restaurantQuery.refetch} />;
  return <Outlet />;
}
