import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Lock as LockIcon, Security as SecurityIcon } from '@mui/icons-material';
import { useStaffPermissions } from '../../context/StaffPermissionContext';

// Permission-based component wrapper
export const PermissionGate = ({ 
  children, 
  permission, 
  fallback = null,
  showLockedMessage = true,
  lockedMessage = "You don't have permission to access this feature"
}) => {
  const { hasFeaturePermission } = useStaffPermissions();
  
  if (!hasFeaturePermission(permission)) {
    if (fallback) {
      return fallback;
    }
    
    if (showLockedMessage) {
      return <LockedFeatureMessage message={lockedMessage} />;
    }
    
    return null;
  }
  
  return children;
};

// Locked feature message component
const LockedFeatureMessage = ({ message }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      sx={{ 
        p: 3, 
        textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.palette.grey[100]}, ${theme.palette.grey[50]})`,
        border: `2px dashed ${theme.palette.grey[300]}`,
        borderRadius: 2
      }}
    >
      <LockIcon 
        sx={{ 
          fontSize: 48, 
          color: theme.palette.grey[400], 
          mb: 2 
        }} 
      />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
        Feature Locked
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Paper>
  );
};

// Feature card with permission check
export const PermissionFeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  permission, 
  children,
  color = 'primary',
  onClick,
  disabled = false
}) => {
  const theme = useTheme();
  const { hasFeaturePermission } = useStaffPermissions();
  const hasPermission = hasFeaturePermission(permission);
  const isDisabled = disabled || !hasPermission;

  return (
    <Paper 
      sx={{ 
        p: 3, 
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
        border: `2px solid ${isDisabled ? theme.palette.grey[300] : theme.palette[color].main}`,
        background: isDisabled 
          ? theme.palette.grey[50] 
          : `linear-gradient(135deg, ${theme.palette[color].main}05, ${theme.palette[color].main}10)`,
        '&:hover': {
          transform: isDisabled ? 'none' : 'translateY(-2px)',
          boxShadow: isDisabled ? theme.shadows[1] : theme.shadows[4],
          borderColor: isDisabled ? theme.palette.grey[300] : theme.palette[color].dark
        }
      }}
      onClick={isDisabled ? undefined : onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box 
          sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            bgcolor: isDisabled ? theme.palette.grey[300] : theme.palette[color].main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            mr: 2
          }}
        >
          {isDisabled ? <LockIcon /> : <Icon />}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        {!hasPermission && (
          <SecurityIcon 
            sx={{ 
              color: theme.palette.warning.main,
              fontSize: 20
            }} 
          />
        )}
      </Box>
      
      {hasPermission && children && (
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      )}
      
      {!hasPermission && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: theme.palette.warning.light,
          borderRadius: 1,
          border: `1px solid ${theme.palette.warning.main}`
        }}>
          <Typography variant="body2" color="warning.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ fontSize: 16 }} />
            Permission required to access this feature
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Permission-based navigation item
export const PermissionNavItem = ({ 
  label, 
  icon: Icon, 
  permission, 
  onClick,
  color = 'primary'
}) => {
  const theme = useTheme();
  const { hasFeaturePermission } = useStaffPermissions();
  const hasPermission = hasFeaturePermission(permission);

  if (!hasPermission) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        cursor: 'pointer',
        borderRadius: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: `${theme.palette[color].main}10`,
          transform: 'translateX(4px)'
        }
      }}
      onClick={onClick}
    >
      <Icon sx={{ color: theme.palette[color].main }} />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
};

// Permission-based action button
export const PermissionButton = ({ 
  children, 
  permission, 
  variant = 'contained',
  color = 'primary',
  disabled = false,
  startIcon,
  onClick,
  ...props 
}) => {
  const { hasFeaturePermission } = useStaffPermissions();
  const hasPermission = hasFeaturePermission(permission);
  const isDisabled = disabled || !hasPermission;

  if (!hasPermission) {
    return null;
  }

  return (
    <Box
      component="button"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1.5,
        px: 3,
        border: 'none',
        borderRadius: 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
        bgcolor: variant === 'contained' ? 'primary.main' : 'transparent',
        color: variant === 'contained' ? 'white' : 'primary.main',
        borderColor: variant === 'outlined' ? 'primary.main' : 'transparent',
        border: variant === 'outlined' ? '1px solid' : 'none',
        '&:hover': {
          bgcolor: isDisabled 
            ? 'primary.main' 
            : variant === 'contained' 
              ? 'primary.dark' 
              : 'primary.light',
          transform: isDisabled ? 'none' : 'translateY(-1px)'
        }
      }}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      {...props}
    >
      {startIcon}
      {children}
    </Box>
  );
};

// Permission status indicator
export const PermissionStatus = ({ permission, size = 'small' }) => {
  const theme = useTheme();
  const { hasFeaturePermission } = useStaffPermissions();
  const hasPermission = hasFeaturePermission(permission);

  return (
    <Box
      sx={{
        width: size === 'small' ? 8 : 12,
        height: size === 'small' ? 8 : 12,
        borderRadius: '50%',
        bgcolor: hasPermission ? theme.palette.success.main : theme.palette.grey[400],
        border: `2px solid ${theme.palette.background.paper}`,
        boxShadow: theme.shadows[1]
      }}
    />
  );
};

export default PermissionGate; 