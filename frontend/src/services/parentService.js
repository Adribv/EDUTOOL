import api from './api';

const parentService = {
  // Profile
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/parents/profile', data),

  // Dashboard
  getDashboard: () => api.get('/parents/dashboard'),

  // Students/Children
  getChildren: () => api.get('/parents/children').then(res => res.data),
  getChildDetails: (rollNumber) => api.get(`/parents/children/${rollNumber}`).then(res => res.data),
  getChildAttendance: (rollNumber, params) => api.get(`/parents/children/${rollNumber}/attendance`, { params }).then(res => res.data),
  getChildProgress: (rollNumber) => api.get(`/parents/children/${rollNumber}/performance`).then(res => res.data),
  linkStudent: (rollNumber) => api.post('/parents/link-student', { rollNumber }),

  // Assignments
  getChildAssignments: (rollNumber) => api.get(`/parents/children/${rollNumber}/assignments`).then(res => res.data),
  getAssignmentDetails: (assignmentId) => api.get(`/parents/assignments/${assignmentId}`),

  // Events
  getUpcomingEvents: () => api.get('/parents/calendar'),
  getEventDetails: (eventId) => api.get(`/parents/events/${eventId}`),

  // Notifications
  getNotifications: () => api.get('/parents/announcements'),
  markNotificationAsRead: (notificationId) => api.put(`/parents/notifications/${notificationId}/read`),
  updateNotificationPreferences: (preferences) => api.put('/parents/notification-preferences', preferences),

  // Communication
  sendMessage: (data) => api.post('/parents/messages', data),
  getMessages: () => api.get('/parents/messages/received'),
  getSentMessages: () => api.get('/parents/messages/sent'),
  getMessageDetails: (messageId) => api.get(`/parents/messages/${messageId}`),

  // Fee Management
  getFeeStructure: (rollNumber, params) => api.get(`/parents/children/${rollNumber}/fee-structure`, { params }),
  getPaymentHistory: (rollNumber, params) => api.get(`/parents/children/${rollNumber}/payment-status`, { params }),
  getPaymentReceipt: (rollNumber, paymentId) => api.get(`/parents/children/${rollNumber}/payment-receipts/${paymentId}`),
  makePayment: (data) => api.post('/parents/payments', data),
  getFees: (rollNumber, params) => api.get(`/parents/children/${rollNumber}/fee-structure`, { params }),
  getPaymentStatus: (rollNumber, params) => api.get(`/parents/children/${rollNumber}/payment-status`, { params }),
  payFees: (data) => api.post('/parents/payments', data),
  getPaymentMethods: () => api.get('/parents/payment-methods'),

  // Feedback
  getFeedbacks: () => api.get('/parents/feedbacks'),
  submitFeedback: (data) => api.post('/parents/feedbacks', data),

  // Leave Requests
  getLeaveRequests: (rollNumber) => api.get(`/parents/children/${rollNumber}/leave-applications`),
  submitLeaveRequest: (rollNumber, data) => api.post(`/parents/children/${rollNumber}/leave-application`, data),
  getChildLeaveApplications: (rollNumber) => api.get(`/parents/children/${rollNumber}/leave-applications`),
  submitLeaveApplication: (rollNumber, data) => api.post(`/parents/children/${rollNumber}/leave-application`, data),

  // Complaints
  getComplaints: () => api.get('/parents/complaints'),
  submitComplaint: (data) => api.post('/parents/complaints', data),

  // Transport
  getChildTransport: (rollNumber) => api.get(`/parents/children/${rollNumber}/transport`),
  contactTransport: (data) => api.post('/parents/transport/contact', data),

  // Health
  getChildHealth: (rollNumber) => api.get(`/parents/children/${rollNumber}/health`),
  getChildHealthIncidents: (rollNumber) => api.get(`/parents/children/${rollNumber}/health/incidents`),
  getChildCounselorRecommendations: (rollNumber) => api.get(`/parents/children/${rollNumber}/health/counselor-recommendations`),

  // Documents
  getChildFeeReceipts: (rollNumber) => api.get(`/parents/children/${rollNumber}/fee-receipts`),
  getSchoolDocuments: (params) => api.get('/parents/school-documents', { params }),
  getChildCertificates: (rollNumber) => api.get(`/parents/children/${rollNumber}/certificates`),

  // Exams
  getChildExams: (rollNumber) => api.get(`/parents/children/${rollNumber}/exams`),
  getChildExamResults: (rollNumber) => api.get(`/parents/children/${rollNumber}/exam-results`),
  getChildReportCards: (rollNumber) => api.get(`/parents/children/${rollNumber}/report-cards`),
  getChildExamSchedule: (rollNumber) => api.get(`/parents/children/${rollNumber}/exam-schedule`),

  // Subjects and Timetable
  getChildSubjects: (rollNumber) => api.get(`/parents/children/${rollNumber}/subjects`),
  getChildTimetable: (rollNumber) => api.get(`/parents/children/${rollNumber}/timetable`),

  // Meetings
  scheduleMeeting: (data) => api.post('/parents/meetings', data),

  // Profile Updates
  requestProfileUpdate: (rollNumber, data) => api.post(`/parents/children/${rollNumber}/update-request`, data),
  

};

export default parentService; 