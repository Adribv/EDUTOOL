import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Button, CircularProgress } from '@mui/material';
import { Security, Visibility, Edit } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { canAccessDashboard, canEditInDashboard, getDashboardDisplayName } from '../utils/permissions';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const PermissionGuard = ({ 
  dashboard, 
  children, 
  requireEdit = false,
  fallbackComponent = null 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        if (!user?._id && !user?.id) {
          setLoadingPermissions(false);
          return;
        }
        
        const staffId = user._id || user.id;
        const res = await api.get(`/admin/permissions/${staffId}`);
        setPermissions(res.data?.data || null);
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
        setError('Failed to load permissions');
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <Security sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please log in to access this dashboard.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  if (loadingPermissions) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading permissions...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <Security sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Permission Error
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  const roleAssignments = permissions?.roleAssignments || [];
  const canView = canAccessDashboard(dashboard, roleAssignments);
  const canEdit = canEditInDashboard(dashboard, roleAssignments);
  const dashboardName = getDashboardDisplayName(dashboard);

  if (!canView) {
    return fallbackComponent || (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <Security sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to view the {dashboardName}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please contact your administrator for access.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  if (requireEdit && !canEdit) {
    return fallbackComponent || (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <Visibility sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            View Only Access
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can view the {dashboardName} but cannot make changes.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please contact your administrator for edit permissions.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
};

// Higher-order component for permission checking
export const withPermission = (dashboard, requireEdit = false) => (Component) => {
  return (props) => (
    <PermissionGuard dashboard={dashboard} requireEdit={requireEdit}>
      <Component {...props} />
    </PermissionGuard>
  );
};

// Hook for checking permissions
export const usePermission = (dashboard) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        if (!user?._id && !user?.id) {
          setLoading(false);
          return;
        }
        
        const staffId = user._id || user.id;
        const res = await api.get(`/admin/permissions/${staffId}`);
        setPermissions(res.data?.data || null);
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
        setError('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const roleAssignments = permissions?.roleAssignments || [];
  const canView = canAccessDashboard(dashboard, roleAssignments);
  const canEdit = canEditInDashboard(dashboard, roleAssignments);
  const dashboardName = getDashboardDisplayName(dashboard);
  
  return {
    canView,
    canEdit,
    loading,
    error,
    permissions,
    dashboardName
  };
};

export default PermissionGuard; 