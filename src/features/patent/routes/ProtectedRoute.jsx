import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

/**
 * ProtectedRoute — Guard for authenticated routes
 *
 * Behavior:
 *   - If not authenticated → redirect to /login (preserves intended path)
 *   - If authenticated → render child routes
 *
 * Usage in AdminRoutes:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     ...
 *   </Route>
 */
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  // Consider authenticated only if both flag and token exist
  const isAuthed = isAuthenticated && !!token;

  if (!isAuthed) {
    // Redirect to login, remember where user wanted to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
