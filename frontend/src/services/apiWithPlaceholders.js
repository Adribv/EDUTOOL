// API wrapper that automatically provides placeholder data when API calls fail
// This ensures the app is always viewable and accessible

import { api } from './api';
import { placeholderData, getPlaceholderData, createMockResponse } from './placeholderData';
import { toast } from 'react-toastify';

// Helper function to get user role from localStorage
const getUserRole = () => {
  return localStorage.getItem('userRole') || 'AdminStaff';
};

// Helper function to show placeholder data notification
const showPlaceholderNotification = (endpoint) => {
  console.warn(`Using placeholder data for: ${endpoint}`);
  toast.info('Using demo data - some features may be limited');
};

// Wrapper for API calls with automatic fallback to placeholder data
export const apiWithPlaceholders = {
  // Generic wrapper for any API call
  async call(apiCall, placeholderKey, userRole = null) {
    try {
      return await apiCall();
    } catch (error) {
      const role = userRole || getUserRole();
      const placeholderData = getPlaceholderData(role, placeholderKey);
      showPlaceholderNotification(apiCall.name || 'API call');
      return createMockResponse(placeholderData);
    }
  },

  // Auth endpoints
  auth: {
    staffLogin: async (credentials) => {
      try {
        return await api.post('/api/staffs/login', credentials);
      } catch (error) {
        // For login, we still want to show the error
        throw error;
      }
    },
    studentLogin: async (credentials) => {
      try {
        return await api.post('/api/students/login', credentials);
      } catch (error) {
        throw error;
      }
    },
    parentLogin: async (credentials) => {
      try {
        return await api.post('/api/parents/login', credentials);
      } catch (error) {
        throw error;
      }
    },
    getProfile: async (role = null) => {
      const userRole = role || getUserRole();
      try {
        switch (userRole) {
          case 'Student':
            return await api.get('/api/students/profile');
          case 'Parent':
            return await api.get('/api/parents/profile');
          default:
            return await api.get('/api/staffs/profile');
        }
      } catch (error) {
        const placeholderProfile = getPlaceholderData(userRole, 'profile');
        showPlaceholderNotification('getProfile');
        return createMockResponse(placeholderProfile);
      }
    }
  },

  // Student endpoints
  student: {
    getDashboard: () => apiWithPlaceholders.call(
      () => api.get('/student/dashboard'),
      'dashboard'
    ),
    getAssignments: () => apiWithPlaceholders.call(
      () => api.get('/student/assignments'),
      'assignments'
    ),
    getAttendance: () => apiWithPlaceholders.call(
      () => api.get('/student/attendance'),
      'attendance'
    ),
    getExams: () => apiWithPlaceholders.call(
      () => api.get('/student/exams'),
      'upcomingExams'
    ),
    getFees: () => apiWithPlaceholders.call(
      () => api.get('/student/fees'),
      'feeStatus'
    ),
    getResources: () => apiWithPlaceholders.call(
      () => api.get('/student/resources'),
      'learningResources'
    ),
    getMessages: () => apiWithPlaceholders.call(
      () => api.get('/student/messages'),
      'messages'
    ),
    getProfile: () => apiWithPlaceholders.call(
      () => api.get('/api/students/profile'),
      'studentProfile'
    ),
    getSubjects: () => apiWithPlaceholders.call(
      () => api.get('/api/students/subjects'),
      'subjects'
    ),
    getAnnouncements: () => apiWithPlaceholders.call(
      () => api.get('/api/students/announcements'),
      'announcements'
    ),
    getPerformanceAnalytics: () => apiWithPlaceholders.call(
      () => api.get('/api/students/performance'),
      'performance'
    ),
    getUpcomingExams: () => apiWithPlaceholders.call(
      () => api.get('/api/students/exams'),
      'upcomingExams'
    ),
    getHomework: () => apiWithPlaceholders.call(
      () => api.get('/api/students/homework'),
      'homework'
    ),
    getPaymentStatus: () => apiWithPlaceholders.call(
      () => api.get('/api/students/payment-status'),
      'feeStatus'
    ),
    getLearningResources: () => apiWithPlaceholders.call(
      () => api.get('/api/students/learning-resources'),
      'learningResources'
    ),
    getLeaveRequests: () => apiWithPlaceholders.call(
      () => api.get('/api/students/leave-requests'),
      'leaveRequests'
    ),
    getOngoingLessons: () => apiWithPlaceholders.call(
      () => api.get('/api/students/ongoing-lessons'),
      'ongoingLessons'
    ),
    getNotifications: () => apiWithPlaceholders.call(
      () => api.get('/api/students/notifications'),
      'notifications'
    ),
    submitAssignment: (assignmentId, data) => apiWithPlaceholders.call(
      () => api.post(`/student/assignments/${assignmentId}/submit`, data),
      'assignmentSubmission'
    ),
  },

  // Admin endpoints
  admin: {
    getDashboardStats: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/dashboard'),
      'adminStats'
    ),
    getProfile: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/profile'),
      'staffProfile'
    ),
    updateProfile: (data) => apiWithPlaceholders.call(
      () => api.put('/api/admin-staff/profile', data),
      'profileUpdate'
    ),
    getAllStaff: (params) => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/staff', { params }),
      'staffList'
    ),
    getAllStudents: (params) => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/students', { params }),
      'studentList'
    ),
    getClasses: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/classes'),
      'classes'
    ),
    getSubjects: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/subjects'),
      'subjects'
    ),
    getEvents: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/calendar'),
      'events'
    ),
    getCommunications: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/communications'),
      'communications'
    ),
    getFeeStructures: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/fee-structure'),
      'feeStructures'
    ),
    getInventory: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/inventory'),
      'inventory'
    ),
    getSchedules: () => apiWithPlaceholders.call(
      () => api.get('/api/admin-staff/schedules'),
      'schedules'
    ),
  },

  // Teacher endpoints
  teacher: {
    getDashboard: () => apiWithPlaceholders.call(
      () => api.get('/teacher/dashboard'),
      'teacherDashboard'
    ),
    getProfile: () => apiWithPlaceholders.call(
      () => api.get('/teacher/profile'),
      'teacherProfile'
    ),
    getClasses: () => apiWithPlaceholders.call(
      () => api.get('/teacher/classes'),
      'classes'
    ),
    getAssignments: () => apiWithPlaceholders.call(
      () => api.get('/teacher/assignments'),
      'assignments'
    ),
    getAnnouncements: () => apiWithPlaceholders.call(
      () => api.get('/teacher/announcements'),
      'announcements'
    ),
    getPerformanceAnalytics: () => apiWithPlaceholders.call(
      () => api.get('/teacher/performance'),
      'performance'
    ),
    getStudents: () => apiWithPlaceholders.call(
      () => api.get('/teacher/students'),
      'students'
    ),
    getGrades: () => apiWithPlaceholders.call(
      () => api.get('/teacher/grades'),
      'grades'
    ),
    getAttendance: () => apiWithPlaceholders.call(
      () => api.get('/teacher/attendance'),
      'attendance'
    ),
    getMessages: () => apiWithPlaceholders.call(
      () => api.get('/teacher/messages'),
      'messages'
    ),
    getNotifications: () => apiWithPlaceholders.call(
      () => api.get('/teacher/notifications'),
      'notifications'
    ),
  },

  // Parent endpoints
  parent: {
    getDashboard: () => apiWithPlaceholders.call(
      () => api.get('/parent/dashboard'),
      'parentDashboard'
    ),
    getProfile: () => apiWithPlaceholders.call(
      () => api.get('/parent/profile'),
      'parentProfile'
    ),
    getChildren: () => apiWithPlaceholders.call(
      () => api.get('/parent/children'),
      'children'
    ),
    getFees: () => apiWithPlaceholders.call(
      () => api.get('/parent/fees'),
      'fees'
    ),
    getMessages: () => apiWithPlaceholders.call(
      () => api.get('/parent/messages'),
      'messages'
    ),
    getNotifications: () => apiWithPlaceholders.call(
      () => api.get('/parent/notifications'),
      'notifications'
    ),
  },

  // HOD endpoints
  hod: {
    getDashboard: () => apiWithPlaceholders.call(
      () => api.get('/hod/dashboard'),
      'hodDashboard'
    ),
    getProfile: () => apiWithPlaceholders.call(
      () => api.get('/hod/profile'),
      'hodProfile'
    ),
    getCourses: () => apiWithPlaceholders.call(
      () => api.get('/hod/courses'),
      'courses'
    ),
    getStaff: () => apiWithPlaceholders.call(
      () => api.get('/hod/staff'),
      'staff'
    ),
    getDepartmentInfo: () => apiWithPlaceholders.call(
      () => api.get('/hod/department'),
      'department'
    ),
  },

  // Principal endpoints
  principal: {
    getDashboard: () => apiWithPlaceholders.call(
      () => api.get('/principal/dashboard'),
      'principalDashboard'
    ),
    getProfile: () => apiWithPlaceholders.call(
      () => api.get('/principal/profile'),
      'principalProfile'
    ),
    getSchoolInfo: () => apiWithPlaceholders.call(
      () => api.get('/principal/school'),
      'schoolInfo'
    ),
    getDepartments: () => apiWithPlaceholders.call(
      () => api.get('/principal/departments'),
      'departments'
    ),
    getStaff: () => apiWithPlaceholders.call(
      () => api.get('/principal/staff'),
      'staff'
    ),
  },

  // Counselor endpoints
  counselor: {
    getDashboard: () => apiWithPlaceholders.call(
      () => api.get('/counselor/dashboard'),
      'counselorDashboard'
    ),
    getProfile: () => apiWithPlaceholders.call(
      () => api.get('/counselor/profile'),
      'counselorProfile'
    ),
    getStudents: () => apiWithPlaceholders.call(
      () => api.get('/counselor/students'),
      'students'
    ),
    getSessions: () => apiWithPlaceholders.call(
      () => api.get('/counselor/sessions'),
      'sessions'
    ),
  }
};

// Export the original api instance as well for direct use when needed
export { api }; 