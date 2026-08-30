import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";

export default function RoleHome() {
  const { user } = useAuth();
  if (user?.role === "platform_admin") return <Navigate to="/restaurants" replace />;
  if (user?.role === "chef") return <Navigate to="/kitchen" replace />;
  if (user?.role === "waiter") return <Navigate to="/orders" replace />;
  return <Navigate to="/dashboard" replace />;
}
