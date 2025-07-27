// Utility functions for activities control

// Get user's activities control from localStorage or context
export const getUserActivitiesControl = () => {
  try {
    const stored = localStorage.getItem('userActivitiesControl');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error parsing activities control:', error);
    return null;
  }
};

// Check if user has access to a specific activity
export const hasActivityAccess = (activity, requiredLevel = 'View') => {
  const activitiesControl = getUserActivitiesControl();
  
  if (!activitiesControl || !activitiesControl.activityAssignments) {
    return false;
  }
  
  const assignment = activitiesControl.activityAssignments.find(a => a.activity === activity);
  if (!assignment) {
    return false;
  }
  
  const accessLevel = assignment.accessLevel;
  
  if (accessLevel === 'Unauthorized') return false;
  if (requiredLevel === 'View') return true;
  if (requiredLevel === 'Edit') return ['Edit', 'Approve'].includes(accessLevel);
  if (requiredLevel === 'Approve') return accessLevel === 'Approve';
  
  return false;
};

// Check if user has any access to an activity
export const hasAnyActivityAccess = (activity) => {
  return hasActivityAccess(activity, 'View');
};

// Check if user can edit an activity
export const canEditActivity = (activity) => {
  return hasActivityAccess(activity, 'Edit');
};

// Check if user can approve an activity
export const canApproveActivity = (activity) => {
  return hasActivityAccess(activity, 'Approve');
};

// Get access level for a specific activity
export const getActivityAccessLevel = (activity) => {
  const activitiesControl = getUserActivitiesControl();
  
  if (!activitiesControl || !activitiesControl.activityAssignments) {
    return 'Unauthorized';
  }
  
  const assignment = activitiesControl.activityAssignments.find(a => a.activity === activity);
  return assignment ? assignment.accessLevel : 'Unauthorized';
};

// Filter menu items based on activities control
export const filterMenuItemsByActivitiesControl = (menuItems) => {
  return menuItems.filter(item => {
    // Always allow Dashboard and Profile
    if (item.text === 'Dashboard' || item.text === 'Profile') {
      return true;
    }
    
    // Check if user has access to this activity
    return hasAnyActivityAccess(item.text);
  });
};

// Filter dashboard tabs based on activities control
export const filterDashboardTabsByActivitiesControl = (tabs, userRole) => {
  const activitiesControl = getUserActivitiesControl();
  
  // If no activities control is found, show all tabs (default permissions)
  if (!activitiesControl || !activitiesControl.activityAssignments) {
    return tabs;
  }
  
  return tabs.filter(tab => {
    // Always allow Overview/Dashboard tab
    if (tab.label === 'Overview' || tab.label === 'Dashboard') {
      return true;
    }
    
    // Map tab labels to activity names
    const activityName = getActivityNameFromTabLabel(tab.label, userRole);
    
    // Check if user has access to this activity
    return hasAnyActivityAccess(activityName);
  });
};

// Get activity name from tab label based on user role
export const getActivityNameFromTabLabel = (tabLabel, userRole) => {
  const activityMappings = {
    // Admin activities
    'Staff Management': 'Staff Management',
    'Student Records': 'Student Records',
    'Fee Management': 'Fee Management',
    'Inventory': 'Inventory',
    'Events': 'Events',
    'Communications': 'Communications',
    'Classes': 'Classes',
    'System Settings': 'System Settings',
    'User Management': 'User Management',
    'Permissions': 'Permissions',
    'Reports': 'Reports',
    'Enquiries': 'Enquiries',
    'Visitors': 'Visitors',
    'Service Requests': 'Service Requests',
    'Syllabus Completion': 'Syllabus Completion',
    'Salary Payroll': 'Salary Payroll',
    
    // Teacher activities
    'Timetable': 'Calendar',
    'Attendance': 'Assignments',
    'Assignments': 'Assignments',
    'Exams': 'Assignments',
    'Students': 'Classes',
    "Student's Approvals": 'Assignments',
    'Leave Request': 'Substitute Teacher Request',
    'Resources': 'Assignments',
    'Lesson Plans': 'Teacher Remarks',
    'Communication': 'Communications',
    'Service Request': 'Counselling Request Form',
    
    // Student activities
    'Courses': 'Courses',
    'Student Assignments': 'Student Assignments',
    'Student Calendar': 'Student Calendar',
    'Student Counselling Request Form': 'Student Counselling Request Form',
    
    // Principal activities
    'Staff Management': 'Principal Staff Management',
    'Student Management': 'Principal Student Management',
    'School Management': 'School Management',
    'Academic Management': 'Academic Management',
    'Approvals': 'Principal Approvals',
    'Reports': 'Principal Reports',
    
    // HOD activities
    'Department Management': 'Department Management',
    'Staff Management': 'HOD Staff Management',
    'Course Management': 'Course Management',
    'Reports': 'HOD Reports',
    'Lesson Plan Approvals': 'Lesson Plan Approvals',
    'Teacher Attendance': 'HOD Staff Management',
    'Teacher Evaluation': 'HOD Staff Management',
    'Class Allocation': 'Course Management',
    'Department Reports': 'HOD Reports',
    
    // Counsellor activities
    'Counselling Requests': 'Counselling Requests',
    
    // IT Admin activities
    'User Management': 'IT User Management',
    'Reports': 'IT Reports',
    'System Settings': 'IT System Settings'
  };
  
  return activityMappings[tabLabel] || tabLabel;
};

// Check if user can perform specific actions based on access level
export const canPerformAction = (activity, action) => {
  const accessLevel = getActivityAccessLevel(activity);
  
  switch (action) {
    case 'view':
      return accessLevel !== 'Unauthorized';
    case 'edit':
      return ['Edit', 'Approve'].includes(accessLevel);
    case 'create':
      return ['Edit', 'Approve'].includes(accessLevel);
    case 'delete':
      return accessLevel === 'Approve';
    case 'approve':
      return accessLevel === 'Approve';
    case 'reject':
      return accessLevel === 'Approve';
    default:
      return false;
  }
};

// Get access level display info
export const getAccessLevelInfo = (activity) => {
  const accessLevel = getActivityAccessLevel(activity);
  
  const levelInfo = {
    'Unauthorized': {
      color: 'error',
      label: 'No Access',
      canView: false,
      canEdit: false,
      canApprove: false
    },
    'View': {
      color: 'info',
      label: 'View Only',
      canView: true,
      canEdit: false,
      canApprove: false
    },
    'Edit': {
      color: 'warning',
      label: 'Can Edit',
      canView: true,
      canEdit: true,
      canApprove: false
    },
    'Approve': {
      color: 'success',
      label: 'Can Approve',
      canView: true,
      canEdit: true,
      canApprove: true
    }
  };
  
  return levelInfo[accessLevel] || levelInfo['Unauthorized'];
};

// Map activity names to menu item texts
export const activityToMenuTextMap = {
  'Staff Management': 'Staff Management',
  'Student Records': 'Student Records',
  'Fee Management': 'Fee Management',
  'Inventory': 'Inventory',
  'Events': 'Events',
  'Communications': 'Communications',
  'Classes': 'Classes',
  'System Settings': 'System Settings',
  'User Management': 'User Management',
  'Permissions': 'Permissions',
  'Reports': 'Reports',
  'Enquiries': 'Enquiries',
  'Visitors': 'Visitors',
  'Service Requests': 'Service Requests',
  'Syllabus Completion': 'Syllabus Completion',
  'Salary Payroll': 'Salary Payroll',
  'Assignments': 'Assignments',
  'Calendar': 'Calendar',
  'Substitute Teacher Request': 'Substitute Teacher Request',
  'My Substitute Requests': 'My Substitute Requests',
  'Teacher Remarks': 'Teacher Remarks',
  'Counselling Request Form': 'Counselling Request Form',
  'Courses': 'Courses',
  'Student Assignments': 'Student Assignments',
  'Student Calendar': 'Student Calendar',
  'Student Counselling Request Form': 'Student Counselling Request Form',
  'Principal Staff Management': 'Staff Management',
  'Principal Student Management': 'Student Management',
  'School Management': 'School Management',
  'Academic Management': 'Academic Management',
  'Principal Approvals': 'Approvals',
  'Principal Reports': 'Reports',
  'Department Management': 'Department Management',
  'HOD Staff Management': 'Staff Management',
  'Course Management': 'Course Management',
  'HOD Reports': 'Reports',
  'Lesson Plan Approvals': 'Lesson Plan Approvals',
  'Counselling Requests': 'Counselling Requests',
  'IT User Management': 'User Management',
  'IT Reports': 'Reports',
  'IT System Settings': 'System Settings'
};

// Get menu text from activity name
export const getMenuTextFromActivity = (activity) => {
  return activityToMenuTextMap[activity] || activity;
};

// Get activity name from menu text
export const getActivityFromMenuText = (menuText) => {
  const entries = Object.entries(activityToMenuTextMap);
  const entry = entries.find(([activity, text]) => text === menuText);
  return entry ? entry[0] : menuText;
};

// Store user activities control in localStorage
export const storeUserActivitiesControl = (activitiesControl) => {
  try {
    localStorage.setItem('userActivitiesControl', JSON.stringify(activitiesControl));
  } catch (error) {
    console.error('Error storing activities control:', error);
  }
};

// Clear user activities control from localStorage
export const clearUserActivitiesControl = () => {
  try {
    localStorage.removeItem('userActivitiesControl');
  } catch (error) {
    console.error('Error clearing activities control:', error);
  }
};

// Get activities control summary for display
export const getActivitiesControlSummary = () => {
  const activitiesControl = getUserActivitiesControl();
  
  if (!activitiesControl || !activitiesControl.activityAssignments) {
    return {
      total: 0,
      view: 0,
      edit: 0,
      approve: 0,
      unauthorized: 0
    };
  }
  
  const assignments = activitiesControl.activityAssignments;
  
  return {
    total: assignments.length,
    view: assignments.filter(a => a.accessLevel === 'View').length,
    edit: assignments.filter(a => a.accessLevel === 'Edit').length,
    approve: assignments.filter(a => a.accessLevel === 'Approve').length,
    unauthorized: assignments.filter(a => a.accessLevel === 'Unauthorized').length
  };
};

// Hook to get user's accessible activities
export const useUserActivitiesControl = () => {
  const activitiesControl = getUserActivitiesControl();
  
  return {
    activitiesControl,
    hasAccess: (activity, level = 'View') => hasActivityAccess(activity, level),
    canEdit: (activity) => canEditActivity(activity),
    canApprove: (activity) => canApproveActivity(activity),
    getAccessLevel: (activity) => getActivityAccessLevel(activity),
    getAccessLevelInfo: (activity) => getAccessLevelInfo(activity),
    canPerformAction: (activity, action) => canPerformAction(activity, action),
    summary: getActivitiesControlSummary()
  };
}; 