import api from './api';

const parentService = {
  // Profile
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/parents/profile', data),

  // Dashboard
  getDashboard: () => api.get('/api/parents/dashboard'),

  // Students/Children
  getChildren: () => api.get('/api/parents/children').then(res => res.data),
  getChildDetails: (rollNumber) => api.get(`/api/parents/children/${rollNumber}`),
  getChildAttendance: (rollNumber, params) => api.get(`/api/parents/children/${rollNumber}/attendance`, { params }),
  getChildProgress: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/performance`),
  linkStudent: (rollNumber) => api.post('/api/parents/link-student', { rollNumber }),

  // Assignments
  getChildAssignments: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/assignments`),
  getAssignmentDetails: (assignmentId) => api.get(`/api/parents/assignments/${assignmentId}`),

  // Events
  getUpcomingEvents: () => api.get('/api/parents/calendar'),
  getEventDetails: (eventId) => api.get(`/api/parents/events/${eventId}`),

  // Notifications
  getNotifications: () => api.get('/api/parents/announcements'),
  markNotificationAsRead: (notificationId) => api.put(`/api/parents/notifications/${notificationId}/read`),
  updateNotificationPreferences: (preferences) => api.put('/api/parents/notification-preferences', preferences),

  // Communication
  sendMessage: (data) => api.post('/api/parents/messages', data),
  getMessages: () => api.get('/api/parents/messages/received'),
  getSentMessages: () => api.get('/api/parents/messages/sent'),
  getMessageDetails: (messageId) => api.get(`/api/parents/messages/${messageId}`),

  // Fee Management
  getFeeStructure: (rollNumber, params) => api.get(`/api/parents/children/${rollNumber}/fee-structure`, { params }),
  getPaymentHistory: (rollNumber, params) => api.get(`/api/parents/children/${rollNumber}/payment-status`, { params }),
  getPaymentReceipt: (rollNumber, paymentId) => api.get(`/api/parents/children/${rollNumber}/payment-receipts/${paymentId}`),
  makePayment: (data) => api.post('/api/parents/payments', data),
  getFees: (rollNumber, params) => api.get(`/api/parents/children/${rollNumber}/fee-structure`, { params }),
  getPaymentStatus: (rollNumber, params) => api.get(`/api/parents/children/${rollNumber}/payment-status`, { params }),
  payFees: (data) => api.post('/api/parents/payments', data),
  getPaymentMethods: () => api.get('/api/parents/payment-methods'),

  // Feedback
  getFeedbacks: () => api.get('/api/parents/feedbacks'),
  submitFeedback: (data) => api.post('/api/parents/feedbacks', data),

  // Leave Requests
  getLeaveRequests: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/leave-applications`),
  submitLeaveRequest: (rollNumber, data) => api.post(`/api/parents/children/${rollNumber}/leave-application`, data),
  getChildLeaveApplications: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/leave-applications`),
  submitLeaveApplication: (rollNumber, data) => api.post(`/api/parents/children/${rollNumber}/leave-application`, data),

  // Complaints
  getComplaints: () => api.get('/api/parents/complaints'),
  submitComplaint: (data) => api.post('/api/parents/complaints', data),

  // Transport
  getChildTransport: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/transport`),
  contactTransport: (data) => api.post('/api/parents/transport/contact', data),

  // Health
  getChildHealth: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/health`),
  getChildHealthIncidents: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/health/incidents`),
  getChildCounselorRecommendations: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/health/counselor-recommendations`),

  // Documents
  getChildFeeReceipts: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/fee-receipts`),
  getSchoolDocuments: (params) => api.get('/api/parents/school-documents', { params }),
  getChildCertificates: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/certificates`),

  // Exams
  getChildExams: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/exams`),
  getChildExamResults: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/exam-results`),
  getChildReportCards: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/report-cards`),
  getChildExamSchedule: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/exam-schedule`),

  // Subjects and Timetable
  getChildSubjects: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/subjects`),
  getChildTimetable: (rollNumber) => api.get(`/api/parents/children/${rollNumber}/timetable`),

  // Meetings
  scheduleMeeting: (data) => api.post('/api/parents/meetings', data),

  // Profile Updates
  requestProfileUpdate: (rollNumber, data) => api.post(`/api/parents/children/${rollNumber}/update-request`, data),
};

export default parentService; 