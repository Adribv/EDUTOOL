// Comprehensive list of admin pages with view-only functionality
// This file serves as a reference for all admin pages and their access control mappings

import React from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';

// Activity mappings for all admin pages
export const ADMIN_PAGE_ACTIVITIES = {
  // Staff Management
  'StaffManagement': 'Staff Management',
  'UserManagement': 'User Management', 
  'A_Users': 'User Management',
  'Teachers': 'Staff Management',
  
  // Student Records
  'StudentRecords': 'Student Records',
  'Students': 'Student Records',
  'Attendance': 'Student Records',
  'Parents': 'Student Records',
  
  // Classes and Subjects
  'Classes': 'Classes',
  'A_Classes': 'Classes',
  'Subjects': 'Classes',
  'A_Subjects': 'Classes',
  'A_Schedules': 'Events',
  'Timetable': 'Events',
  'CurriculumTemplateDemo': 'Classes',
  
  // School Management
  'SchoolManagement': 'School Management',
  
  // Fee Management
  'Fee_Management': 'Fee Management',
  'FeeConfiguration': 'Fee Management',
  'Fees': 'Fee Management',
  'FeeRecords': 'Fee Management',
  'SalaryPayroll': 'Salary Payroll',
  
  // Inventory
  'Inventory_Management': 'Inventory',
  'A_Inventory': 'Inventory',
  'UnifiedStationeryRequestPage': 'Inventory',
  'SupplierRequestManagement': 'Inventory',
  
  // Permissions and Settings
  'PermissionsManagement': 'Permissions',
  'SystemSettings': 'System Settings',
  'A_Settings': 'System Settings',
  'Settings': 'System Settings',
  
  // Reports
  'Reports': 'Reports',
  'A_Reports': 'Reports',
  'Results': 'Reports',
  'Exams': 'Reports',
  
  // Events and Communication
  'A_Events': 'Events',
  'A_Communication': 'Communications',
  'EventConsentForm': 'Events',
  
  // Other Features
  'Enquiries': 'Enquiries',
  'A_Enquiries': 'Enquiries',
  'EnquiryManagement': 'Enquiries',
  'Visitors': 'Visitors',
  'Disciplinary_Forms': 'Student Records',
  'DisciplinaryFormsManagement': 'Student Records',
  'DisciplinaryFormTemplate': 'Student Records',
  'DisciplinaryFormTemplateEditor': 'Student Records',
  'Teacher_Remarks': 'Syllabus Completion',
  'TeacherRemarks': 'Syllabus Completion',
  'SyllabusCompletion': 'Syllabus Completion',
  'A_ServiceRequests': 'Service Requests',
  'TransportFormCreate': 'Transport Management',
  'TransportFormsManagement': 'Transport Management',
  'TransportFormView': 'Transport Management',
  'Profile': 'Profile Management'
};

// Access level descriptions
export const ACCESS_LEVEL_DESCRIPTIONS = {
  'View': {
    label: 'View Only',
    description: 'Can view information but cannot create, edit, or delete',
    color: 'warning'
  },
  'Edit': {
    label: 'Edit Access', 
    description: 'Can view and edit information, but cannot delete or approve',
    color: 'info'
  },
  'Approve': {
    label: 'Full Access',
    description: 'Can perform all operations including approvals and deletions',
    color: 'success'
  },
  'Full': {
    label: 'Full Access',
    description: 'Complete administrative access',
    color: 'success'
  },
  'Unauthorized': {
    label: 'No Access',
    description: 'Cannot access this feature',
    color: 'error'
  }
};

// CRUD operation permissions
export const CRUD_PERMISSIONS = {
  'View': ['read'],
  'Edit': ['read', 'create', 'update'],
  'Approve': ['read', 'create', 'update', 'delete', 'approve'],
  'Full': ['read', 'create', 'update', 'delete', 'approve']
};

// View-only interface features
export const VIEW_ONLY_FEATURES = {
  // Visual Indicators
  'Access Level Banner': 'Shows current access level with clear description',
  'View Only Chip': 'Prominent "VIEW ONLY" indicator in header',
  'Grayed Background': 'Different background color for view-only content',
  'Disabled Buttons': 'All edit/create/delete buttons are disabled',
  'Hidden Actions': 'Action columns and buttons are hidden for view-only users',
  
  // Functionality
  'Read-Only Tables': 'All data tables show information but no edit actions',
  'Filtered Quick Actions': 'Only view-related actions are available',
  'Toast Messages': 'Clear error messages for unauthorized actions',
  'Access Denied Pages': 'Proper error pages for unauthorized access',
  
  // User Experience
  'Clear Messaging': 'Users understand their access limitations',
  'Graceful Degradation': 'Interface remains functional in view-only mode',
  'Consistent Styling': 'Uniform view-only appearance across all pages'
};

// Admin Dashboard Integration
export const DASHBOARD_INTEGRATION = {
  'Tab Filtering': 'Only accessible tabs are shown based on VP permissions',
  'Navigation Guards': 'Prevents access to unauthorized tabs',
  'Access Level Display': 'Shows overall access mode in dashboard header',
  'Quick Actions Filtering': 'Only permitted actions are available',
  'Visual Feedback': 'Clear indicators of current access level'
};

// Implementation Status
export const IMPLEMENTATION_STATUS = {
  'Completed': [
    'AdminDashboard.jsx - Main dashboard with view-only functionality',
    'StaffManagement.jsx - Staff management with access control',
    'StudentRecords.jsx - Student records with view-only mode',
    'Inventory_Management.jsx - Inventory management with access control',
    'ViewOnlyWrapper.jsx - Reusable view-only wrapper component',
    'accessControlUtils.js - Access control utilities and hooks'
  ],
  'Pending': [
    'All other admin pages need similar view-only implementation',
    'Individual page access control integration',
    'Testing with different access levels',
    'Performance optimization for large datasets'
  ]
};

// Usage Instructions
export const USAGE_INSTRUCTIONS = {
  'For Developers': {
    '1. Import Components': 'Import ViewOnlyWrapper and useAccessControl',
    '2. Add Access Control': 'Use useAccessControl hook with page key',
    '3. Wrap Content': 'Wrap main return with ViewOnlyWrapper',
    '4. Disable Actions': 'Add disabled props to buttons based on permissions',
    '5. Hide Actions': 'Conditionally render action columns/buttons'
  },
  'For VP Users': {
    '1. Set Access Levels': 'Configure access levels in activities control',
    '2. Test Permissions': 'Verify view-only functionality works correctly',
    '3. Monitor Usage': 'Check that users cannot perform unauthorized actions'
  }
};

// Example implementation for a new admin page
export const EXAMPLE_IMPLEMENTATION = `
import ViewOnlyWrapper from './ViewOnlyWrapper';
import { useAccessControl, canPerformAction } from './accessControlUtils';

function NewAdminPage() {
  const { accessLevel, isViewOnly, hasEditAccess, hasViewAccess, loading } = useAccessControl('PageKey');
  
  // Access denied check
  if (!loading && !hasViewAccess) {
    return (
      <ViewOnlyWrapper
        title="Page Title"
        description="Page description"
        accessLevel={accessLevel}
        activity="Activity Name"
      >
        <Alert severity="error">Access Denied</Alert>
      </ViewOnlyWrapper>
    );
  }
  
  return (
    <ViewOnlyWrapper
      title="Page Title"
      description="Page description"
      accessLevel={accessLevel}
      activity="Activity Name"
    >
      {/* Page content with disabled buttons and hidden actions */}
      <Button disabled={!canPerformAction(accessLevel, 'create')}>
        Add Item
      </Button>
    </ViewOnlyWrapper>
  );
}
`;

const ViewOnlyPages = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Pages View-Only Implementation Guide
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Activity Mappings
            </Typography>
            {Object.entries(ADMIN_PAGE_ACTIVITIES).map(([page, activity]) => (
              <Box key={page} sx={{ mb: 1 }}>
                <Chip label={page} size="small" sx={{ mr: 1 }} />
                <Typography variant="body2" component="span">
                  → {activity}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Access Levels
            </Typography>
            {Object.entries(ACCESS_LEVEL_DESCRIPTIONS).map(([level, info]) => (
              <Box key={level} sx={{ mb: 1 }}>
                <Chip 
                  label={info.label} 
                  color={info.color} 
                  size="small" 
                  sx={{ mr: 1 }} 
                />
                <Typography variant="body2" component="span">
                  {info.description}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewOnlyPages; 