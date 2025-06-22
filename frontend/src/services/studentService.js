import api from './api';

const studentService = {
  // Auth
  login: (credentials) => api.post('/api/student/login', credentials),
  register: (data) => api.post('/api/student/register', data),
  
  // Profile
  getProfile: () => api.get('/api/student/profile'),
  updateProfile: (data) => api.put('/api/student/profile', data),
  
  // Academic Dashboard
  getTimetable: () => api.get('/api/student/timetable'),
  getSubjectsAndTeachers: () => api.get('/api/student/subjects'),
  getAssignments: () => api.get('/api/student/assignments'),
  submitAssignment: (assignmentId, data) => 
    api.post(`/api/student/assignments/${assignmentId}/submit`, data),
  getSubmissionFeedback: (submissionId) => 
    api.get(`/api/student/submissions/${submissionId}/feedback`),
  
  // Attendance
  getAttendanceRecords: () => api.get('/api/student/attendance'),
  submitLeaveRequest: (data) => api.post('/api/student/leave-requests', data),
  getLeaveRequests: () => api.get('/api/student/leave-requests'),
  
  // Examinations
  getUpcomingExams: () => api.get('/api/student/exams/upcoming'),
  getAdmitCard: (examId) => api.get(`/api/student/exams/${examId}/admit-card`),
  getExamResults: () => api.get('/api/student/exam-results'),
  getReportCards: () => api.get('/api/student/report-cards'),
  getPerformanceAnalytics: () => api.get('/api/student/performance-analytics'),
  
  // Fee Management
  getFeeStructure: () => api.get('/api/student/fee-structure'),
  getPaymentStatus: () => api.get('/api/student/payment-status'),
  getPaymentReceipt: (paymentId) => 
    api.get(`/api/student/payment-receipts/${paymentId}`),
  
  // Learning Resources
  getLearningResources: () => api.get('/api/student/learning-resources'),
  getResourceDetails: (resourceId) => 
    api.get(`/api/student/learning-resources/${resourceId}`),
  
  // Communication
  getAnnouncements: () => api.get('/api/student/announcements'),
  getMessages: () => api.get('/api/student/messages'),
  getMessageDetails: (messageId) => 
    api.get(`/api/student/messages/${messageId}`),
  sendMessageReply: (messageId, data) => 
    api.post(`/api/student/messages/${messageId}/reply`, data),
  getClassDiscussions: () => api.get('/api/student/class-discussions'),
  getDiscussionDetails: (discussionId) => 
    api.get(`/api/student/class-discussions/${discussionId}`),
  postDiscussionComment: (discussionId, data) => 
    api.post(`/api/student/class-discussions/${discussionId}/comments`, data),
  
  // Homework
  getHomework: () => api.get('/api/student/homework'),
  getHomeworkDetails: (homeworkId) => 
    api.get(`/api/student/homework/${homeworkId}`),
  submitHomework: (homeworkId, data) => 
    api.post(`/api/student/homework/${homeworkId}/submit`, data),
  getHomeworkSubmissions: () => api.get('/api/student/homework-submissions'),
};

export default studentService; 