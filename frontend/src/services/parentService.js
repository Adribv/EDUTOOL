import api from './api';

const parentService = {
  // Profile
  getProfile: () => api.get('/parent/profile'),
  updateProfile: (data) => api.put('/parent/profile', data),

  // Dashboard
  getDashboard: () => api.get('/parent/dashboard'),

  // Students
  getStudents: () => api.get('/parent/students'),
  getStudentDetails: (studentId) => api.get(`/parent/students/${studentId}`),
  getStudentAttendance: (studentId) => api.get(`/parent/students/${studentId}/attendance`),
  getStudentProgress: (studentId) => api.get(`/parent/students/${studentId}/progress`),

  // Assignments
  getStudentAssignments: (studentId) => api.get(`/parent/students/${studentId}/assignments`),
  getAssignmentDetails: (assignmentId) => api.get(`/parent/assignments/${assignmentId}`),

  // Events
  getUpcomingEvents: () => api.get('/parent/events/upcoming'),
  getEventDetails: (eventId) => api.get(`/parent/events/${eventId}`),

  // Notifications
  getNotifications: () => api.get('/parent/notifications'),
  markNotificationAsRead: (notificationId) => api.put(`/parent/notifications/${notificationId}/read`),
  updateNotificationPreferences: (preferences) => api.put('/parent/notification-preferences', preferences),

  // Communication
  sendMessage: (data) => api.post('/parent/messages', data),
  getMessages: () => api.get('/parent/messages'),
  getMessageDetails: (messageId) => api.get(`/parent/messages/${messageId}`),

  // Fee Management
  getFeeStructure: () => api.get('/parent/fee-structure'),
  getPaymentHistory: () => api.get('/parent/payment-history'),
  makePayment: (data) => api.post('/parent/payments', data),

  // Feedback
  getFeedbacks: () => api.get('/parent/feedbacks'),
  submitFeedback: (data) => api.post('/parent/feedbacks', data),

  // Leave Requests
  getLeaveRequests: () => api.get('/parent/leave-requests'),
  submitLeaveRequest: (data) => api.post('/parent/leave-requests', data),

  // Complaints
  getComplaints: () => api.get('/parent/complaints'),
  submitComplaint: (data) => api.post('/parent/complaints', data),
};

export default parentService; 