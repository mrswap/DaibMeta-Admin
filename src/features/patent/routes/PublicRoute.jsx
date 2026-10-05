import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

/**
 * PublicRoute — Guard for public routes (login, register, etc.)
 *
 * Behavior:
 *   - If already authenticated → redirect to /dashboard
 *   - Otherwise → render public route (login page)
 */
const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const isAuthed = isAuthenticated && !!token;

  if (isAuthed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
