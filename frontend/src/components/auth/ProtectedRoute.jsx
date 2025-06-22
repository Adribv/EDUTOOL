import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      // Check for student token if student role is allowed
      if (allowedRoles.includes('student')) {
        const studentToken = localStorage.getItem('studentToken');
        if (studentToken) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }

      // Check for parent token if parent role is allowed
      if (allowedRoles.includes('parent')) {
        const parentToken = localStorage.getItem('parentToken');
        if (parentToken) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }

      // Check for staff token for other roles
      if (isAuthenticated && user) {
        const hasRole = allowedRoles.includes(user.role);
        setIsAuthorized(hasRole);
      } else {
        setIsAuthorized(false);
      }
      
      setIsLoading(false);
    };

    if (!loading) {
      checkAuthorization();
    }
  }, [loading, isAuthenticated, user, allowedRoles]);

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      if (allowedRoles.includes('student')) {
        toast.error('Please login as a student to access this page');
      } else if (allowedRoles.includes('parent')) {
        toast.error('Please login as a parent to access this page');
      } else {
        toast.error('Please login to access this page');
      }
    }
  }, [isLoading, isAuthorized, allowedRoles]);

  if (loading || isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!isAuthorized) {
    if (allowedRoles.includes('student')) {
      return <Navigate to="/student-login" replace />;
    } else if (allowedRoles.includes('parent')) {
      return <Navigate to="/parent-login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute; 