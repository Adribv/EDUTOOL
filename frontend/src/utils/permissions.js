// Dashboard to role mapping
export const DASHBOARD_ROLE_MAPPING = {
  // Mental Wellness Dashboard
  mentalWellness: {
    roleKey: 'wellnessCounsellor',
    displayName: 'Mental Wellness Dashboard'
  },

  // Soft Skills Manager Dashboard
  softSkills: {
    roleKey: 'skillsCoordinator',
    displayName: 'Soft Skills Manager Dashboard'
  },

  // Transport Manager Dashboard
  transport: {
    roleKey: 'supportStaffsManager',
    displayName: 'Transport Manager Dashboard'
  },

  // Examiner Dashboard
  examiner: {
    roleKey: 'examinationController',
    displayName: 'Examiner Dashboard'
  },

  // Support Staff Manager Dashboard
  supportStaff: {
    roleKey: 'supportStaffsManager',
    displayName: 'Support Staff Manager Dashboard'
  }
};

// Access level definitions
export const ACCESS_LEVELS = {
  UNAUTHORIZED: 'Unauthorized',
  VIEW_ACCESS: 'View Access',
  EDIT_ACCESS: 'Edit Access'
};

// Helper function to check if user has access to a dashboard
export const checkDashboardAccess = (dashboard, roleAssignments) => {
  if (!roleAssignments || !Array.isArray(roleAssignments)) {
    return { canView: false, canEdit: false };
  }

  const dashboardConfig = DASHBOARD_ROLE_MAPPING[dashboard];
  if (!dashboardConfig) {
    return { canView: false, canEdit: false };
  }

  const roleAssignment = roleAssignments.find(ra => ra.role === dashboardConfig.roleKey);
  if (!roleAssignment) {
    return { canView: false, canEdit: false };
  }

  const access = roleAssignment.access;
  
  return {
    canView: access === ACCESS_LEVELS.VIEW_ACCESS || access === ACCESS_LEVELS.EDIT_ACCESS,
    canEdit: access === ACCESS_LEVELS.EDIT_ACCESS
  };
};

// Helper function to get all dashboard permissions for a user
export const getUserDashboardPermissions = (roleAssignments) => {
  const permissions = {};
  
  Object.keys(DASHBOARD_ROLE_MAPPING).forEach(dashboard => {
    permissions[dashboard] = checkDashboardAccess(dashboard, roleAssignments);
  });
  
  return permissions;
};

// Helper function to check if user can access dashboard
export const canAccessDashboard = (dashboard, roleAssignments) => {
  return checkDashboardAccess(dashboard, roleAssignments).canView;
};

// Helper function to check if user can edit in dashboard
export const canEditInDashboard = (dashboard, roleAssignments) => {
  return checkDashboardAccess(dashboard, roleAssignments).canEdit;
};

// Helper function to get accessible dashboards for a user
export const getAccessibleDashboards = (roleAssignments) => {
  return Object.keys(DASHBOARD_ROLE_MAPPING).filter(dashboard => 
    canAccessDashboard(dashboard, roleAssignments)
  );
};

// Helper function to get editable dashboards for a user
export const getEditableDashboards = (roleAssignments) => {
  return Object.keys(DASHBOARD_ROLE_MAPPING).filter(dashboard => 
    canEditInDashboard(dashboard, roleAssignments)
  );
};

// Helper function to get dashboard display name
export const getDashboardDisplayName = (dashboard) => {
  return DASHBOARD_ROLE_MAPPING[dashboard]?.displayName || dashboard;
};

// Helper function to get all available dashboards
export const getAllDashboards = () => {
  return Object.keys(DASHBOARD_ROLE_MAPPING);
}; 