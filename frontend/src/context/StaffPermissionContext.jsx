import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Action Types
const ACTIONS = {
  SET_STAFF_PERMISSIONS: 'SET_STAFF_PERMISSIONS',
  UPDATE_STAFF_ROLES: 'UPDATE_STAFF_ROLES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_PERMISSIONS: 'CLEAR_PERMISSIONS',
  ADD_STAFF_MEMBER: 'ADD_STAFF_MEMBER',
  REMOVE_STAFF_MEMBER: 'REMOVE_STAFF_MEMBER',
  UPDATE_STAFF_STATUS: 'UPDATE_STAFF_STATUS',
  UPDATE_STAFF_PERMISSIONS: 'UPDATE_STAFF_PERMISSIONS'
};

// Initial State
const initialState = {
  staffMembers: [],
  currentUserPermissions: [],
  loading: false,
  error: null,
  roleDefinitions: {
    librarian: {
      name: 'Librarian',
      description: 'Manage library resources and book borrowing',
      permissions: ['view_library_dashboard', 'manage_books', 'manage_borrowings', 'generate_reports'],
      color: '#1976d2',
      icon: 'LibraryBooks'
    },
    counselor: {
      name: 'Mental Wellness Counselor',
      description: 'Provide mental health support and counseling',
      permissions: ['view_counselor_dashboard', 'manage_sessions', 'manage_assessments', 'view_student_records'],
      color: '#388e3c',
      icon: 'Psychology'
    },
    ptteacher: {
      name: 'PT Teacher',
      description: 'Manage sports events and fitness assessments',
      permissions: ['view_pt_dashboard', 'manage_events', 'manage_fitness_records', 'manage_teams'],
      color: '#f57c00',
      icon: 'SportsSoccer'
    },
    eventhandler: {
      name: 'Event Handler',
      description: 'Organize and manage school events',
      permissions: ['view_event_dashboard', 'manage_events', 'manage_vendors', 'manage_schedules'],
      color: '#7b1fa2',
      icon: 'Event'
    },
    transportmanager: {
      name: 'Transport Manager',
      description: 'Manage transportation and routes',
      permissions: ['view_transport_dashboard', 'manage_routes', 'manage_vehicles', 'track_transport'],
      color: '#d32f2f',
      icon: 'DirectionsBus'
    },
    softskillsmanager: {
      name: 'Soft Skills Manager',
      description: 'Track soft skills and achievements',
      permissions: ['view_skills_dashboard', 'manage_achievements', 'track_skills', 'generate_reports'],
      color: '#ff6f00',
      icon: 'EmojiEvents'
    },
    admin: {
      name: 'Administrator',
      description: 'Full system access and management',
      permissions: ['*'],
      color: '#424242',
      icon: 'AdminPanelSettings'
    }
  }
};

// Reducer
const staffPermissionReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_STAFF_PERMISSIONS:
      return {
        ...state,
        staffMembers: action.payload,
        loading: false,
        error: null
      };

    case ACTIONS.UPDATE_STAFF_ROLES:
      const updatedStaff = state.staffMembers.map(staff => 
        staff._id === action.payload.staffId 
          ? { ...staff, assignedRoles: action.payload.roles }
          : staff
      );
      return {
        ...state,
        staffMembers: updatedStaff
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case ACTIONS.CLEAR_PERMISSIONS:
      return {
        ...initialState,
        roleDefinitions: state.roleDefinitions
      };

    case ACTIONS.ADD_STAFF_MEMBER:
      return {
        ...state,
        staffMembers: [...state.staffMembers, action.payload]
      };

    case ACTIONS.REMOVE_STAFF_MEMBER:
      return {
        ...state,
        staffMembers: state.staffMembers.filter(staff => staff._id !== action.payload)
      };

    case ACTIONS.UPDATE_STAFF_STATUS:
      const statusUpdatedStaff = state.staffMembers.map(staff =>
        staff._id === action.payload.staffId
          ? { ...staff, status: action.payload.status }
          : staff
      );
      return {
        ...state,
        staffMembers: statusUpdatedStaff
      };

    case ACTIONS.UPDATE_STAFF_PERMISSIONS:
      const permissionsUpdatedStaff = state.staffMembers.map(staff =>
        staff._id === action.payload.staffId
          ? { ...staff, permissions: action.payload.permissions }
          : staff
      );
      return {
        ...state,
        staffMembers: permissionsUpdatedStaff
      };

    default:
      return state;
  }
};

// Create Context
const StaffPermissionContext = createContext();

// Provider Component
export const StaffPermissionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(staffPermissionReducer, initialState);
  const { user, loading: authLoading } = useAuth();

  // Load staff permissions on mount
  useEffect(() => {
    if (user && !authLoading) {
      loadStaffPermissions();
    }
  }, [user, authLoading]);

  // Mock API call - replace with actual API
  const loadStaffPermissions = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Simulate API call
      const mockStaffData = [
        {
          _id: '1',
          name: 'John Smith',
          email: 'john.smith@school.edu',
          department: 'Library',
          primaryRole: 'librarian',
          assignedRoles: ['librarian'],
          joinDate: '2023-01-15',
          status: 'Active',
          permissions: {
            inventory: {
              view_inventory: true,
              manage_inventory: true,
              approve_requests: false,
              generate_reports: true
            },
            student_records: {
              view_students: true,
              edit_students: false,
              view_academics: false,
              manage_attendance: false
            },
            teacher_remarks: {
              view_remarks: true,
              add_remarks: false,
              edit_remarks: false,
              approve_remarks: false
            },
            feedbacks: {
              view_feedback: true,
              respond_feedback: true,
              manage_feedback: false,
              generate_reports: false
            },
            events: {
              view_events: true,
              create_events: false,
              manage_events: false,
              approve_events: false
            },
            communication: {
              send_messages: true,
              view_messages: true,
              manage_announcements: false,
              access_notifications: true
            }
          }
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@school.edu',
          department: 'Counseling',
          primaryRole: 'counselor',
          assignedRoles: ['counselor'],
          joinDate: '2023-02-20',
          status: 'Active',
          permissions: {
            inventory: {
              view_inventory: false,
              manage_inventory: false,
              approve_requests: false,
              generate_reports: false
            },
            student_records: {
              view_students: true,
              edit_students: true,
              view_academics: true,
              manage_attendance: false
            },
            teacher_remarks: {
              view_remarks: true,
              add_remarks: true,
              edit_remarks: true,
              approve_remarks: false
            },
            feedbacks: {
              view_feedback: true,
              respond_feedback: true,
              manage_feedback: true,
              generate_reports: true
            },
            events: {
              view_events: true,
              create_events: true,
              manage_events: false,
              approve_events: false
            },
            communication: {
              send_messages: true,
              view_messages: true,
              manage_announcements: true,
              access_notifications: true
            }
          }
        },
        {
          _id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@school.edu',
          department: 'Physical Education',
          primaryRole: 'ptteacher',
          assignedRoles: ['ptteacher'],
          joinDate: '2023-03-10',
          status: 'Active',
          permissions: {
            inventory: {
              view_inventory: true,
              manage_inventory: false,
              approve_requests: false,
              generate_reports: false
            },
            student_records: {
              view_students: true,
              edit_students: false,
              view_academics: false,
              manage_attendance: true
            },
            teacher_remarks: {
              view_remarks: true,
              add_remarks: true,
              edit_remarks: false,
              approve_remarks: false
            },
            feedbacks: {
              view_feedback: true,
              respond_feedback: true,
              manage_feedback: false,
              generate_reports: false
            },
            events: {
              view_events: true,
              create_events: true,
              manage_events: true,
              approve_events: false
            },
            communication: {
              send_messages: true,
              view_messages: true,
              manage_announcements: false,
              access_notifications: true
            }
          }
        },
        {
          _id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@school.edu',
          department: 'Events',
          primaryRole: 'eventhandler',
          assignedRoles: ['eventhandler'],
          joinDate: '2023-04-05',
          status: 'Active',
          permissions: {
            inventory: {
              view_inventory: true,
              manage_inventory: false,
              approve_requests: false,
              generate_reports: false
            },
            student_records: {
              view_students: false,
              edit_students: false,
              view_academics: false,
              manage_attendance: false
            },
            teacher_remarks: {
              view_remarks: false,
              add_remarks: false,
              edit_remarks: false,
              approve_remarks: false
            },
            feedbacks: {
              view_feedback: true,
              respond_feedback: true,
              manage_feedback: false,
              generate_reports: false
            },
            events: {
              view_events: true,
              create_events: true,
              manage_events: true,
              approve_events: true
            },
            communication: {
              send_messages: true,
              view_messages: true,
              manage_announcements: true,
              access_notifications: true
            }
          }
        },
        {
          _id: '5',
          name: 'David Brown',
          email: 'david.brown@school.edu',
          department: 'Transportation',
          primaryRole: 'transportmanager',
          assignedRoles: ['transportmanager'],
          joinDate: '2023-05-12',
          status: 'Active',
          permissions: {
            inventory: {
              view_inventory: false,
              manage_inventory: false,
              approve_requests: false,
              generate_reports: false
            },
            student_records: {
              view_students: true,
              edit_students: false,
              view_academics: false,
              manage_attendance: false
            },
            teacher_remarks: {
              view_remarks: false,
              add_remarks: false,
              edit_remarks: false,
              approve_remarks: false
            },
            feedbacks: {
              view_feedback: true,
              respond_feedback: true,
              manage_feedback: false,
              generate_reports: false
            },
            events: {
              view_events: true,
              create_events: false,
              manage_events: false,
              approve_events: false
            },
            communication: {
              send_messages: true,
              view_messages: true,
              manage_announcements: false,
              access_notifications: true
            }
          }
        },
        {
          _id: '6',
          name: 'Lisa Garcia',
          email: 'lisa.garcia@school.edu',
          department: 'Student Development',
          primaryRole: 'softskillsmanager',
          assignedRoles: ['softskillsmanager'],
          joinDate: '2023-06-18',
          status: 'Active',
          permissions: {
            inventory: {
              view_inventory: false,
              manage_inventory: false,
              approve_requests: false,
              generate_reports: false
            },
            student_records: {
              view_students: true,
              edit_students: false,
              view_academics: true,
              manage_attendance: false
            },
            teacher_remarks: {
              view_remarks: true,
              add_remarks: true,
              edit_remarks: false,
              approve_remarks: false
            },
            feedbacks: {
              view_feedback: true,
              respond_feedback: true,
              manage_feedback: true,
              generate_reports: true
            },
            events: {
              view_events: true,
              create_events: false,
              manage_events: false,
              approve_events: false
            },
            communication: {
              send_messages: true,
              view_messages: true,
              manage_announcements: false,
              access_notifications: true
            }
          }
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ type: ACTIONS.SET_STAFF_PERMISSIONS, payload: mockStaffData });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Update staff roles
  const updateStaffRoles = async (staffId, newRoles) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({
        type: ACTIONS.UPDATE_STAFF_ROLES,
        payload: { staffId, roles: newRoles }
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Add new staff member
  const addStaffMember = async (staffData) => {
    try {
      // Mock API call - replace with actual API
      const newStaff = {
        _id: Date.now().toString(),
        ...staffData,
        joinDate: new Date().toISOString(),
        status: 'Active',
        permissions: {
          inventory: {
            view_inventory: false,
            manage_inventory: false,
            approve_requests: false,
            generate_reports: false
          },
          student_records: {
            view_students: false,
            edit_students: false,
            view_academics: false,
            manage_attendance: false
          },
          teacher_remarks: {
            view_remarks: false,
            add_remarks: false,
            edit_remarks: false,
            approve_remarks: false
          },
          feedbacks: {
            view_feedback: false,
            respond_feedback: false,
            manage_feedback: false,
            generate_reports: false
          },
          events: {
            view_events: false,
            create_events: false,
            manage_events: false,
            approve_events: false
          },
          communication: {
            send_messages: false,
            view_messages: false,
            manage_announcements: false,
            access_notifications: false
          }
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ type: ACTIONS.ADD_STAFF_MEMBER, payload: newStaff });
      return { success: true, staff: newStaff };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Remove staff member
  const removeStaffMember = async (staffId) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ type: ACTIONS.REMOVE_STAFF_MEMBER, payload: staffId });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Update staff status
  const updateStaffStatus = async (staffId, status) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({
        type: ACTIONS.UPDATE_STAFF_STATUS,
        payload: { staffId, status }
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Update staff permissions
  const updateStaffPermissions = async (staffId, newPermissions) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({
        type: ACTIONS.UPDATE_STAFF_PERMISSIONS,
        payload: { staffId, permissions: newPermissions }
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Get user's assigned roles
    const userStaff = state.staffMembers.find(staff => staff.email === user.email);
    if (!userStaff) return false;
    
    // Check if any of user's roles have the required permission
    return userStaff.assignedRoles.some(role => {
      const roleDef = state.roleDefinitions[role];
      return roleDef && (roleDef.permissions.includes('*') || roleDef.permissions.includes(permission));
    });
  };

  // Check if user has specific feature permission
  const hasFeaturePermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Get user's assigned roles
    const userStaff = state.staffMembers.find(staff => staff.email === user.email);
    if (!userStaff) return false;
    
    // Check if user has the specific feature permission
    const [category, feature] = permission.split('.');
    return userStaff.permissions?.[category]?.[feature] || false;
  };

  // Check if user has any of the specified roles
  const hasRole = (roles) => {
    if (!user) return false;
    
    // Admin has all roles
    if (user.role === 'admin') return true;
    
    // Get user's assigned roles
    const userStaff = state.staffMembers.find(staff => staff.email === user.email);
    if (!userStaff) return false;
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    return userStaff.assignedRoles.some(role => userRoles.includes(role));
  };

  // Get user's assigned roles
  const getUserRoles = () => {
    if (!user) return [];
    
    const userStaff = state.staffMembers.find(staff => staff.email === user.email);
    return userStaff ? userStaff.assignedRoles : [];
  };

  // Get user's feature permissions
  const getUserFeaturePermissions = () => {
    if (!user) return {};
    
    const userStaff = state.staffMembers.find(staff => staff.email === user.email);
    return userStaff?.permissions || {};
  };

  // Get role definition
  const getRoleDefinition = (role) => {
    return state.roleDefinitions[role] || null;
  };

  // Get all role definitions
  const getAllRoleDefinitions = () => {
    return state.roleDefinitions;
  };

  // Get staff member by ID
  const getStaffMember = (staffId) => {
    return state.staffMembers.find(staff => staff._id === staffId);
  };

  // Get staff members by role
  const getStaffByRole = (role) => {
    return state.staffMembers.filter(staff => staff.assignedRoles.includes(role));
  };

  // Get current user's staff profile
  const getCurrentUserStaff = () => {
    if (!user) return null;
    return state.staffMembers.find(staff => staff.email === user.email);
  };

  // Clear permissions (for logout)
  const clearPermissions = () => {
    dispatch({ type: ACTIONS.CLEAR_PERMISSIONS });
  };

  const value = {
    // State
    staffMembers: state.staffMembers,
    loading: state.loading,
    error: state.error,
    roleDefinitions: state.roleDefinitions,
    
    // Actions
    updateStaffRoles,
    updateStaffPermissions,
    addStaffMember,
    removeStaffMember,
    updateStaffStatus,
    loadStaffPermissions,
    clearPermissions,
    
    // Utility functions
    hasPermission,
    hasRole,
    hasFeaturePermission,
    getUserRoles,
    getUserFeaturePermissions,
    getRoleDefinition,
    getAllRoleDefinitions,
    getStaffMember,
    getStaffByRole,
    getCurrentUserStaff
  };

  return (
    <StaffPermissionContext.Provider value={value}>
      {children}
    </StaffPermissionContext.Provider>
  );
};

// Custom Hook
export const useStaffPermissions = () => {
  const context = useContext(StaffPermissionContext);
  if (!context) {
    throw new Error('useStaffPermissions must be used within a StaffPermissionProvider');
  }
  return context;
};

// Higher Order Component for role-based access control
export const withRoleAccess = (WrappedComponent, requiredRoles) => {
  return function RoleProtectedComponent(props) {
    const { hasRole } = useStaffPermissions();
    
    if (!hasRole(requiredRoles)) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Required roles: {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}</p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Permission-based component wrapper
export const PermissionGate = ({ children, permission, fallback = null }) => {
  const { hasPermission } = useStaffPermissions();
  
  if (!hasPermission(permission)) {
    return fallback;
  }
  
  return children;
};

// Role-based component wrapper
export const RoleGate = ({ children, roles, fallback = null }) => {
  const { hasRole } = useStaffPermissions();
  
  if (!hasRole(roles)) {
    return fallback;
  }
  
  return children;
}; 