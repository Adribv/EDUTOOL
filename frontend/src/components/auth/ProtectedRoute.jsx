import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to access this page');
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (!loading && isAuthenticated && !allowedRoles.includes(user?.role)) {
      toast.error('You do not have permission to access this page');
    }
  }, [loading, isAuthenticated, user, allowedRoles]);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 