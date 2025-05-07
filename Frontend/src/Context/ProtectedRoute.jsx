import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Check if role exists & is allowed
  if (!role) {
    return <Navigate to="/layout/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
