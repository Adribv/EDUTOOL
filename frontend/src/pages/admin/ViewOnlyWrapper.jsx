import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  Chip,
  useTheme,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// View Only Wrapper Component
const ViewOnlyWrapper = ({ 
  children, 
  title, 
  description, 
  accessLevel, 
  activity,
  showBanner = true 
}) => {
  const theme = useTheme();
  
  const getAccessType = (level) => {
    if (level === 'View') return 'View Only';
    if (level === 'Edit') return 'Edit Access';
    if (level === 'Approve') return 'Full Access';
    if (level === 'Full') return 'Full Access';
    return 'No Access';
  };

  const isViewOnly = accessLevel === 'View';

  return (
    <Box sx={{ p: 3 }}>
      {/* Access Level Banner */}
      {showBanner && (
        <Alert 
          severity={isViewOnly ? 'warning' : 'info'} 
          sx={{ mb: 3 }}
          icon={isViewOnly ? <WarningIcon /> : <InfoIcon />}
        >
          <AlertTitle>Access Level: {getAccessType(accessLevel)}</AlertTitle>
          {isViewOnly && `You have VIEW-ONLY access to ${activity}. You can view information but cannot create, edit, or delete any records.`}
          {accessLevel === 'Edit' && `You can view and edit ${activity}. Approval and deletion actions are not allowed.`}
          {accessLevel === 'Approve' && `You have full access to manage ${activity} including approvals and deletions.`}
          {accessLevel === 'Unauthorized' && `You do not have access to ${activity} features.`}
        </Alert>
      )}

      {/* Page Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        bgcolor: isViewOnly ? '#fafafa' : 'white',
        border: isViewOnly ? '1px solid #e0e0e0' : '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: isViewOnly ? '#666' : 'text.primary' }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {description}
              </Typography>
            )}
          </Box>
          {isViewOnly && (
            <Chip
              label="VIEW ONLY"
              icon={<ViewIcon />}
              color="warning"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
      </Paper>

      {/* Content */}
      <Box sx={{ 
        bgcolor: isViewOnly ? '#fafafa' : 'white',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        {children}
      </Box>

      {/* View Only Footer */}
      {isViewOnly && (
        <Paper sx={{ 
          p: 2, 
          mt: 3, 
          bgcolor: '#fff3cd', 
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ color: '#856404' }}>
            <strong>View Only Mode:</strong> This page is in read-only mode. Contact your Vice Principal for edit permissions.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ViewOnlyWrapper; 