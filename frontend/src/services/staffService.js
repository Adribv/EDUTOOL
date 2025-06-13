import api from './api';

const staffService = {
  // Calendar
  getCalendarEvents: () => api.get('/staff/calendar-events'),
  // Class Activities
  getClassActivities: () => api.get('/staff/class-activities'),
  createClassActivity: (data) => api.post('/staff/class-activities', data),
  // Class Performance
  getClassPerformance: () => api.get('/staff/class-performance'),
  // Exam Control
  getExams: () => api.get('/staff/exams'),
  createExam: (data) => api.post('/staff/exams', data),
  // Feedback
  getFeedbacks: () => api.get('/staff/feedbacks'),
  // Forum
  getDiscussions: () => api.get('/staff/discussions'),
  createDiscussion: (data) => api.post('/staff/discussions', data),
  // Leave
  getLeaveRequests: () => api.get('/staff/leave-requests'),
  submitLeaveRequest: (data) => api.post('/staff/leave-requests', data),
  // Attendance
  getStudents: () => api.get('/staff/students'),
  markAttendance: (data) => api.post('/staff/attendance', data),
  // Parent Interactions
  getParentInteractions: () => api.get('/staff/parent-interactions'),
  createParentInteraction: (data) => api.post('/staff/parent-interactions', data),
  // Inventory
  getInventoryItems: () => api.get('/staff/inventory'),
  createInventoryItem: (data) => api.post('/staff/inventory', data),
  // Profile
  getProfile: () => api.get('/staff/profile'),
  updateProfile: (data) => api.put('/staff/profile', data),
};

export default staffService; 