import { useAuth } from '../../context/AuthContext';
import { staffActivitiesControlAPI } from '../../services/api';
import { useState, useEffect } from 'react';

// Activity mapping for different admin pages
export const activityMapping = {
  // Staff Management related
  'StaffManagement': 'Staff Management',
  'UserManagement': 'User Management',
  'A_Users': 'User Management',
  
  // Student Records related
  'StudentRecords': 'Student Records',
  'Students': 'Student Records',
  'Attendance': 'Student Records',
  'Classes': 'Classes',
  'A_Classes': 'Classes',
  'Subjects': 'Classes',
  'A_Subjects': 'Classes',
  'A_Schedules': 'Events',
  
  // Fee Management related
  'Fee_Management': 'Fee Management',
  'FeeConfiguration': 'Fee Management',
  'Fees': 'Fee Management',
  'FeeRecords': 'Fee Management',
  'SalaryPayroll': 'Salary Payroll',
  
  // Inventory related
  'Inventory_Management': 'Inventory',
  'A_Inventory': 'Inventory',
  
  // Permissions related
  'PermissionsManagement': 'Permissions',
  'SystemSettings': 'System Settings',
  'A_Settings': 'System Settings',
  
  // Reports related
  'Reports': 'Reports',
  'A_Reports': 'Reports',
  'Results': 'Reports',
  'Exams': 'Reports',
  
  // Events and Communication
  'A_Events': 'Events',
  'A_Communication': 'Communications',
  
  // Other features
  'Enquiries': 'Enquiries',
  'A_Enquiries': 'Enquiries',
  'Visitors': 'Visitors',
  'Disciplinary_Forms': 'Student Records',
  'Teacher_Remarks': 'Syllabus Completion',
  'A_ServiceRequests': 'Service Requests',
  'Timetable': 'Events',
  'Parents': 'Student Records',
  'Teachers': 'Staff Management',
  'TransportFormCreate': 'Transport Management',
  'TransportFormsManagement': 'Transport Management',
  'TransportFormView': 'Transport Management',
  'UnifiedStationeryRequestPage': 'Inventory',
  'SupplierRequestManagement': 'Inventory',
  'EventConsentForm': 'Events',
  'DisciplinaryFormsManagement': 'Student Records',
  'DisciplinaryFormTemplate': 'Student Records',
  'DisciplinaryFormTemplateEditor': 'Student Records',
  'EnquiryManagement': 'Enquiries',
  'SyllabusCompletion': 'Syllabus Completion',
  'CurriculumTemplateDemo': 'Classes',
  'Profile': 'Profile Management'
};

// Hook to get user's access level for a specific page
export const useAccessControl = (pageKey) => {
  const { user } = useAuth();
  const [accessLevel, setAccessLevel] = useState('Full'); // Default to full access
  const [loading, setLoading] = useState(true);
  const [userActivitiesControl, setUserActivitiesControl] = useState(null);

  useEffect(() => {
    const fetchUserActivitiesControl = async () => {
      try {
        if (user?._id || user?.id) {
          const response = await staffActivitiesControlAPI.getMyActivities();
          const activitiesControl = response?.data;
          
          if (activitiesControl) {
            setUserActivitiesControl(activitiesControl);
            
            // Find the activity for this page
            const activity = activityMapping[pageKey];
            if (activity) {
              const activityAssignment = activitiesControl.activityAssignments?.find(
                a => a.activity === activity
              );
              
              if (activityAssignment) {
                setAccessLevel(activityAssignment.accessLevel);
              } else {
                setAccessLevel('Unauthorized');
              }
            } else {
              // If no mapping found, default to full access
              setAccessLevel('Full');
            }
          } else {
            // No activities control found, default to full access
            setAccessLevel('Full');
          }
        }
      } catch (error) {
        console.log('Error fetching activities control:', error);
        setAccessLevel('Full'); // Default to full access on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivitiesControl();
  }, [user, pageKey]);

  const isViewOnly = accessLevel === 'View';
  const hasEditAccess = accessLevel === 'Edit' || accessLevel === 'Approve' || accessLevel === 'Full';
  const hasViewAccess = accessLevel !== 'Unauthorized';

  return {
    accessLevel,
    isViewOnly,
    hasEditAccess,
    hasViewAccess,
    loading,
    userActivitiesControl
  };
};

// Helper function to check if user can perform specific actions
export const canPerformAction = (accessLevel, action) => {
  const actionPermissions = {
    'read': ['View', 'Edit', 'Approve', 'Full'],
    'create': ['Edit', 'Approve', 'Full'],
    'update': ['Edit', 'Approve', 'Full'],
    'delete': ['Approve', 'Full'],
    'approve': ['Approve', 'Full']
  };

  return actionPermissions[action]?.includes(accessLevel) || false;
};

// Helper function to get access type display name
export const getAccessTypeDisplay = (accessLevel) => {
  switch (accessLevel) {
    case 'View': return 'View Only';
    case 'Edit': return 'Edit Access';
    case 'Approve': return 'Full Access';
    case 'Full': return 'Full Access';
    case 'Unauthorized': return 'No Access';
    default: return 'Unknown';
  }
};

// Helper function to get activity name for a page
export const getActivityName = (pageKey) => {
  return activityMapping[pageKey] || pageKey;
}; 