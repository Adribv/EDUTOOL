import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/staffs/profile'),
};

// Student endpoints
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getAssignments: () => api.get('/student/assignments'),
  getAttendance: () => api.get('/student/attendance'),
  getExams: () => api.get('/student/exams'),
  getFees: () => api.get('/student/fees'),
  getResources: () => api.get('/student/resources'),
  getMessages: () => api.get('/student/messages'),
  submitAssignment: (assignmentId, data) => 
    api.post(`/student/assignments/${assignmentId}/submit`, data),
};

// Staff endpoints
export const staffAPI = {
  getDashboard: () => api.get('/admin-staff/dashboard'),
  getClasses: () => api.get('/admin-staff/classes'),
  getAssignments: () => api.get('/admin-staff/assignments'),
  getExams: () => api.get('/admin-staff/exams'),
  getStudents: () => api.get('/admin-staff/students'),
  createAssignment: (data) => api.post('/admin-staff/assignments', data),
  createExam: (data) => api.post('/admin-staff/exams', data),
  gradeAssignment: (assignmentId, data) => 
    api.post(`/admin-staff/assignments/${assignmentId}/grade`, data),
  markAttendance: (classId, data) => 
    api.post(`/admin-staff/classes/${classId}/attendance`, data),
  getProfile: () => api.get('/admin-staff/profile'),
  updateProfile: (data) => api.put('/admin-staff/profile', data),
  uploadProfileImage: (formData) => api.post('/admin-staff/profile/image', formData),
  getAttendance: () => api.get('/admin-staff/attendance'),
  getEvents: () => api.get('/admin-staff/events'),
  getNotifications: () => api.get('/admin-staff/notifications'),
};

// Parent endpoints
export const parentAPI = {
  getDashboard: () => api.get('/parent/dashboard'),
  getChildren: () => api.get('/parent/children'),
  getChildProgress: (childId) => api.get(`/parent/children/${childId}/progress`),
  getFees: () => api.get('/parent/fees'),
  getMessages: () => api.get('/parent/messages'),
  payFees: (data) => api.post('/parent/fees/pay', data),
  getProfile: () => api.get('/parent/profile'),
  updateProfile: (data) => api.put('/parent/profile', data),
  uploadProfileImage: (formData) => api.post('/parent/profile/image', formData),
  getChildGrades: (childId) => api.get(`/parent/children/${childId}/grades`),
  getChildAttendance: (childId) => api.get(`/parent/children/${childId}/attendance`),
  getChildAssignments: (childId) => api.get(`/parent/children/${childId}/assignments`),
  getChildExams: (childId) => api.get(`/parent/children/${childId}/exams`),
  getFeeBalance: (childId) => api.get(`/parent/children/${childId}/fees/balance`),
  getUpcomingPayments: (childId) => api.get(`/parent/children/${childId}/fees/upcoming`),
  getPaymentHistory: (childId) => api.get(`/parent/children/${childId}/fees/history`),
  getPaymentMethods: () => api.get('/parent/payment-methods'),
  makePayment: (data) => api.post('/parent/payments', data),
  downloadReceipt: (paymentId) => api.get(`/parent/payments/${paymentId}/receipt`, { responseType: 'blob' }),
};

// Admin endpoints
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin-staff/dashboard'),

  // Profile Management
  getProfile: () => api.get('/admin-staff/profile'),
  updateProfile: (data) => api.put('/admin-staff/profile', data),
  updatePassword: (data) => api.put('/admin-staff/profile/password', data),
  uploadProfileImage: (formData) => api.post('/admin-staff/profile/image', formData),

  // Staff Management
  getAllStaff: (params) => api.get('/admin-staff/staff', { params }),
  getStaffById: (staffId) => api.get(`/admin-staff/staff/${staffId}`),
  registerStaff: (data) => api.post('/admin-staff/staff', data),
  updateStaff: (staffId, data) => api.put(`/admin-staff/staff/${staffId}`, data),
  deleteStaff: (staffId) => api.delete(`/admin-staff/staff/${staffId}`),
  getStaffAttendance: () => api.get('/admin-staff/staff/attendance'),
  generateStaffReport: (params) => api.get('/admin-staff/staff/reports', { params }),

  // Student Management
  getAllStudents: (params) => api.get('/admin-staff/students', { params }),
  getStudentById: (studentId) => api.get(`/admin-staff/students/${studentId}`),
  registerStudent: (data) => api.post('/admin-staff/students', data),
  updateStudent: (studentId, data) => api.put(`/admin-staff/students/${studentId}`, data),
  deleteStudent: (studentId) => api.delete(`/admin-staff/students/${studentId}`),
  generateStudentReport: (params) => api.get('/admin-staff/reports/students', { params }),

  // Fee Management
  configureFeeStructure: (data) => api.post('/admin-staff/fees/structure', data),
  updateFeeStructure: (data) => api.put('/admin-staff/fees/structure', data),
  getFeeStructure: () => api.get('/admin-staff/fees/structure'),
  generateFeeReport: (params) => api.get('/admin-staff/reports/fee-collection', { params }),

  // System Settings
  updateSchoolInfo: (data) => api.put('/admin-staff/configuration/school-info', data),
  getSchoolInfo: () => api.get('/admin-staff/configuration/school-info'),
  configureTimetable: (data) => api.post('/admin-staff/configuration/timetable', data),
  getTimetable: (params) => api.get('/admin-staff/configuration/timetable', { params }),

  // User Management
  createUser: (data) => api.post('/admin-staff/users', data),
  getAllUsers: (params) => api.get('/admin-staff/users', { params }),
  updateUser: (userId, data) => api.put(`/admin-staff/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin-staff/users/${userId}`),
  resetUserPassword: (userId) => api.post(`/admin-staff/users/${userId}/reset-password`),

  // Reports
  generateAttendanceReport: (params) => api.get('/admin-staff/reports/attendance', { params }),
  generateAcademicReport: (params) => api.get('/admin-staff/reports/academic', { params }),
  generateFinancialReport: (params) => api.get('/admin-staff/reports/financial', { params }),
};

export default api; 