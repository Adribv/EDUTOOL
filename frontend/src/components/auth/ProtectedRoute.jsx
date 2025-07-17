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
      const generalToken = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');

      // Check for student access
      if (allowedRoles.includes('Student')) {
        const studentToken = localStorage.getItem('studentToken');
        if (studentToken || (generalToken && userRole === 'Student')) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }

      // Check for parent access
      if (allowedRoles.includes('Parent')) {
        const parentToken = localStorage.getItem('parentToken');
        if (parentToken || (generalToken && userRole === 'Parent')) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }

      // Check for staff token for other roles
      if (isAuthenticated && user) {
        // Normalize user role to lowercase for comparison
        const userRole = (user.role || '').toLowerCase();
        
        // Check if any of the allowed roles match (case-insensitive)
        const hasRole = allowedRoles.some(allowedRole => 
          allowedRole.toLowerCase() === userRole
        );
        
        setIsAuthorized(hasRole);
        
        // Store the role in localStorage for consistency
        if (user.role) {
          localStorage.setItem('userRole', user.role);
        }
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
      if (allowedRoles.includes('Student')) {
        toast.error('Please login as a student to access this page');
      } else {
        toast.error('Please login to access this page');
      }
    }
  }, [isLoading, isAuthorized, allowedRoles]);

  if (loading || isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!isAuthorized) {
    if (allowedRoles.includes('Student')) {
      return <Navigate to="/student-login" replace />;
    } else if (allowedRoles.includes('Parent')) {
      return <Navigate to="/parent-login" replace />;
    } else {
      return <Navigate to="/management-login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute; 