import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "./UI/LoadingSpinner"; // Assuming you have a LoadingSpinner component

const ProtectedRoute = ({ allowedRoles = ["user", "admin"] }) => {
  const { user, loading, isAuthenticated } = useAuth(); // CRITICAL: Getting all three states

  // 1. If Loading, show a spinner (WAIT for authentication check to finish)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 2. If Authentication is settled, check user status
  if (isAuthenticated && user) {
    // Check if the user's role is allowed to access this route
    if (allowedRoles.includes(user.role)) {
      return <Outlet />; // Render the child route
    } else {
      // User is logged in but does not have the required role (e.g., trying to access AdminRoute)
      // Redirect to a dashboard or a 403 Forbidden page
      return <Navigate to="/" replace />; // Redirect to home
    }
  }

  // 3. If Authentication is settled and failed (not logged in)
  // The response interceptor in config.js also handles this by redirecting to /login,
  // but this is the component-level safety net.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
