import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

const StudentParentAccessGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Check if user is logged in
      if (!user) {
        toast.error('Please log in to access this portal');
        navigate('/');
        return;
      }

      // Check if user has student or parent role
      const studentParentRoles = ['student', 'parent'];
      const managementRoles = ['AdminStaff', 'Teacher', 'HOD', 'Principal', 'Counsellor'];
      const userRole = user.role || user.Role || '';

      if (managementRoles.includes(userRole)) {
        toast.error('Access denied. This portal is for students and parents only.');
        navigate('/management-login');
        return;
      }

      if (!studentParentRoles.includes(userRole)) {
        toast.error('Access denied. Invalid user role.');
        navigate('/');
        return;
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white' }}>
          Verifying access...
        </Typography>
      </Box>
    );
  }

  // If user is not logged in or doesn't have student/parent role, don't render children
  if (!user) {
    return null;
  }

  const studentParentRoles = ['student', 'parent'];
  const managementRoles = ['AdminStaff', 'Teacher', 'HOD', 'Principal', 'Counsellor'];
  const userRole = user.role || user.Role || '';

  if (managementRoles.includes(userRole) || !studentParentRoles.includes(userRole)) {
    return null;
  }

  return children;
};

export default StudentParentAccessGuard; 