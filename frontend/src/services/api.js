import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:50001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  // Staff/Admin login
  staffLogin: (credentials) => api.post('/staffs/login', credentials),
  // Student login
  studentLogin: (credentials) => api.post('/students/login', credentials),
  // Parent login
  parentLogin: (credentials) => api.post('/parents/login', credentials),
  parentRegister: (data) => api.post('/parents/register', data),
  // Common endpoints
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Student endpoints
export const studentAPI = {
  // Auth
  studentLogin: (credentials) => api.post('/students/login', credentials),
  register: (data) => api.post('/students/register', data),
  
  // Profile
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  changePassword: (data) => api.put('/students/change-password', data),
  
  // Academic Dashboard
  getTimetable: () => api.get('/students/timetable'),
  getSubjects: () => api.get('/students/subjects'),
  getAssignments: () => api.get('/students/assignments'),
  getAssignmentDetails: (assignmentId) => api.get(`/students/assignments/${assignmentId}`),
  submitAssignment: (assignmentId, data) => {
    const formData = new FormData();
    
    // Add text content if provided
    if (data.content) {
      formData.append('content', data.content);
    }
    
    // Add file if provided
    if (data.file) {
      formData.append('file', data.file);
    }
    
    return api.post(`/students/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getSubmissionFeedback: (submissionId) => api.get(`/students/submissions/${submissionId}`),
  
  // Attendance
  getAttendance: (params) => api.get('/students/attendance', { params }),
  submitLeaveRequest: (data) => api.post('/students/leave-requests', data),
  getLeaveRequests: () => api.get('/students/leave-requests'),
  
  // Examinations
  getExams: () => api.get('/students/exams/upcoming'),
  getAdmitCard: (examId) => api.get(`/students/exams/${examId}/admit-card`),
  getExamResults: () => api.get('/students/exam-results'),
  getReportCards: () => api.get('/students/report-cards'),
  getPerformanceAnalytics: () => api.get('/students/performance-analytics'),
  
  // Fee Management
  getFeeStructure: (params) => api.get('/students/fee-structure', { params }),
  getFees: (params) => api.get('/students/payment-status', { params }),
  getPaymentReceipt: (paymentId) => api.get(`/students/payment-receipts/${paymentId}`),
  makePayment: (paymentData) => api.post('/students/payments', paymentData),
  submitPayment: (paymentData) => api.post('/students/payments', paymentData),
  
  // Learning Resources
  getResources: (params) => api.get('/students/learning-resources', { params }),
  getResourceDetails: (resourceId) => api.get(`/students/learning-resources/${resourceId}`),
  getResourceSubjects: () => api.get('/students/learning-resources/subjects'),
  getLessonPlans: (params) => api.get('/students/learning-resources', { params }),
  
  // Communication
  getAnnouncements: () => api.get('/students/announcements'),
  getMessages: () => api.get('/students/messages'),
  getMessageDetails: (messageId) => api.get(`/students/messages/${messageId}`),
  sendMessageReply: (messageId, data) => api.post(`/students/messages/${messageId}/reply`, data),
  getClassDiscussions: () => api.get('/students/class-discussions'),
  getDiscussionDetails: (discussionId) => api.get(`/students/class-discussions/${discussionId}`),
  postDiscussionComment: (discussionId, data) => api.post(`/students/class-discussions/${discussionId}/comments`, data),
  
  // Homework
  getHomework: () => api.get('/students/homework'),
  getHomeworkDetails: (homeworkId) => api.get(`/students/homework/${homeworkId}`),
  submitHomework: (homeworkId, data) => api.post(`/students/homework/${homeworkId}/submit`, data),
  getHomeworkSubmissions: () => api.get('/students/homework-submissions'),
  
  // Documents
  getDocuments: () => api.get('/students/documents'),
  
  // MCQ Assignments
  getMCQAssignments: () => api.get('/students/mcq-assignments'),
  getMCQAssignmentDetails: (assignmentId) => api.get(`/students/mcq-assignments/${assignmentId}`),
  startMCQAssignment: (assignmentId) => api.post(`/students/mcq-assignments/${assignmentId}/start`),
  submitMCQAssignment: (assignmentId, data) => api.post(`/students/mcq-assignments/${assignmentId}/submit`, data),
  getMCQSubmissionResults: (assignmentId) => api.get(`/students/mcq-assignments/${assignmentId}/results`),
  
  // Test functions
  testStudentFeeRecords: () => api.get('/students/test-fee-records'),
  createTestFeeRecords: () => api.post('/students/create-test-fee-records'),
  
  // IT Support Request Management
  createITSupportRequest: (data) => api.post('/students/it-support-requests', data),
  getITSupportRequests: () => api.get('/students/it-support-requests'),
  getITSupportStats: () => api.get('/students/it-support-requests/stats'),
  getITSupportRequestById: (requestId) => api.get(`/students/it-support-requests/${requestId}`),
  updateITSupportRequest: (requestId, data) => api.put(`/students/it-support-requests/${requestId}`, data),
  deleteITSupportRequest: (requestId) => api.delete(`/students/it-support-requests/${requestId}`),
  
  // Legacy endpoints for backward compatibility
  getDashboard: () => api.get('/students/profile'),
};

// Staff endpoints
export const staffAPI = {
  getDashboard: () => api.get('/staffs/dashboard'),
  getCoordinatedStudents: () => api.get('/staffs/coordinated-students'),
  getCoordinatedParents: () => api.get('/staffs/coordinated-parents'),
  getCoordinatedClasses: () => api.get('/staffs/coordinated-classes'),
  getProfile: () => api.get('/staffs/profile'),
  updateProfile: (data) => api.put('/staffs/profile', data),
  getLeaveRequests: () => api.get('/staffs/leave-requests'),
  updateLeaveRequest: (id, data) => api.put(`/staffs/leave-requests/${id}`, data),
  getClasses: () => api.get('/admin-staff/classes').then(res=>{
    const mapClass = (c)=>({
      ...c,
      id: c._id || c.id,
      teacherId: c.classTeacher || c.teacherId,
    });
    return Array.isArray(res.data) ? res.data.map(mapClass) : [];
  }),
  getAssignments: () => api.get('/admin-staff/assignments'),
  getExams: () => api.get('/admin-staff/exams'),
  getStudents: () => api.get('/admin-staff/students'),
  createAssignment: (data) => api.post('/admin-staff/assignments', data),
  createExam: (data) => api.post('/admin-staff/exams', data),
  gradeAssignment: (assignmentId, data) => 
    api.post(`/admin-staff/assignments/${assignmentId}/grade`, data),
  markAttendance: (classId, data) => 
    api.post(`/admin-staff/classes/${classId}/attendance`, data),
  uploadProfileImage: (formData) => api.post('/admin-staff/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAttendance: () => api.get('/admin-staff/attendance'),
  getEvents: () => api.get('/admin-staff/events'),
  getNotifications: () => api.get('/admin-staff/notifications'),
  getSalaryRecords: (staffId) => {
    console.log('🔍 Frontend requesting salary records for staffId:', staffId);
    return api.get(`/staffs/salary-records/${staffId}`).then(res => {
      console.log('✅ Salary records response:', res.data);
      return Array.isArray(res.data) ? res.data : [];
    }).catch(error => {
      console.error('❌ Salary records request failed:', error);
      throw error;
    });
  },
};

// Parent endpoints
export const parentAPI = {
  getDashboard: () => api.get('/parents/dashboard').then(res=>res.data),
  getChildren: () => api.get('/parents/children').then(res => res.data),
  getChildProfile: (childId) => api.get(`/parents/children/${childId}`).then(res => res.data),
  getChildProgress: (childId) => api.get(`/parents/children/${childId}/performance`).then(res => res.data),
  getFees: (childId, params) => api.get(`/parents/children/${childId}/fee-structure`, { params }),
  getMessages: () => api.get('/parents/messages/received').then(res=>res.data),
  getSentMessages: () => api.get('/parents/messages/sent').then(res=>res.data),
  payFees: (data) => api.post('/parents/payments', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/parents/profile', data),
  uploadProfileImage: (formData) => api.post('/parents/profile/image', formData),
  getChildGrades: (childId) => api.get(`/parents/children/${childId}/exam-results`).then(res => res.data),
  getChildAttendance: (childId, params) => api.get(`/parents/children/${childId}/attendance`, { params }).then(res => res.data),
  getChildAssignments: (childId) => api.get(`/parents/children/${childId}/assignments`).then(res => res.data),
  getChildExams: (childId) => api.get(`/parents/children/${childId}/exams`).then(res => res.data),
  getFeeBalance: (childId) => api.get(`/parents/children/${childId}/payment-status`).then(res => res.data),
  getUpcomingPayments: (childId) => api.get(`/parents/children/${childId}/payment-status`).then(res => res.data),
  getPaymentHistory: (childId) => api.get(`/parents/children/${childId}/payment-status`).then(res => res.data),
  getPaymentMethods: () => api.get('/parents/payment-methods'),
  makePayment: (data) => api.post('/parents/payments', data),
  downloadReceipt: (childId, paymentId) => api.get(`/parents/children/${childId}/payment-receipts/${paymentId}`, { responseType: 'blob' }),
  getChildTransport: (childId) => api.get(`/parents/children/${childId}/transport`),
  getChildHealth: (childId) => api.get(`/parents/children/${childId}/health`),
  getChildSubjects: (childId) => api.get(`/parents/children/${childId}/subjects`),
  getChildTimetable: (childId) => api.get(`/parents/children/${childId}/timetable`),
  getChildReportCards: (childId) => api.get(`/parents/children/${childId}/report-cards`),
  getChildLeaveApplications: (childId) => api.get(`/parents/children/${childId}/leave-applications`),
  submitLeaveRequest: (childId, data) => api.post(`/parents/children/${childId}/leave-application`, data),
  sendMessage: (data) => api.post('/parents/messages', data),
  submitComplaint: (data) => api.post('/parents/complaints', data),
  scheduleMeeting: (data) => api.post('/parents/meetings', data),
  getAnnouncements: () => api.get('/parents/announcements'),
  getSchoolCalendar: (params) => api.get('/parents/calendar', { params }),
  linkStudent: (rollNumber) => api.post('/parents/link-student', { rollNumber }),
  getChildrenFeeStatus: () => api.get('/parents/children/fee-status').then(res => res.data),

  // Parent Transport Form APIs
  getParentTransportForms: () => api.get('/parents/transport-forms').then(res => res.data),
  createTransportForm: (formData) => api.post('/parents/transport-forms', formData).then(res => res.data),
  getTransportFormById: (formId) => api.get(`/parents/transport-forms/${formId}`).then(res => res.data),
  updateTransportForm: (formId, formData) => api.put(`/parents/transport-forms/${formId}`, formData).then(res => res.data),
  deleteTransportForm: (formId) => api.delete(`/parents/transport-forms/${formId}`).then(res => res.data),
  downloadTransportFormPDF: (formId) => api.get(`/parents/transport-forms/${formId}/download-pdf`, { 
    responseType: 'blob' 
  }).then(res => res.data),
  downloadAdminTransportFormPDF: (formId) => api.get(`/parents/transport-forms/${formId}/download-admin-pdf`, { 
    responseType: 'blob' 
  }).then(res => res.data),

  // Test functions
  createTestParent: () => api.post('/parents/create-test-parent').then(res => res.data),
};

// Admin endpoints
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin-staff/dashboard'),

  // Profile Management
  getProfile: () => api.get('/admin-staff/profile').then(res => res.data),
  updateProfile: (data) => api.put('/admin-staff/profile', data),
  updatePassword: (data) => api.put('/admin-staff/profile/password', data),
  uploadProfileImage: (formData) => api.post('/admin-staff/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Staff Management
  getAllStaff: (params) => api.get('/admin-staff/staff', { params }),
  getStaffById: (staffId) => api.get(`/admin-staff/staff/${staffId}`),
  registerStaff: (data) => api.post('/admin-staff/staff', data),
  updateStaff: (staffId, data) => api.put(`/admin-staff/staff/${staffId}`, data),
  deleteStaff: (staffId) => api.delete(`/admin-staff/staff/${staffId}`),
  getStaffAttendance: () => api.get('/admin-staff/staff/attendance'),
  generateStaffReport: (params) => api.get('/admin-staff/reports/staff', { params }),
  getDepartments: () => api.get('/admin-staff/departments').then(res => res.data),
  getSalaryRecords: (staffId) => {
    const params = staffId ? { staffId } : {};
    return api.get('/admin-staff/fee-records/staff', { params }).then(res => Array.isArray(res.data.data) ? res.data.data : []);
  },

  // Student Management
  getAllStudents: (params) => api.get('/admin-staff/students', { params }).then(res => res.data),
  getStudentById: (studentId) => api.get(`/admin-staff/students/${studentId}`),
  registerStudent: (data) => api.post('/admin-staff/students', data),
  updateStudent: (studentId, data) => api.put(`/admin-staff/students/${studentId}`, data),
  deleteStudent: (studentId) => api.delete(`/admin-staff/students/${studentId}`),
  generateStudentReport: (params = {}) => api.get('/admin-staff/reports/enrollment', { params: { ...params, format: 'pdf' }, responseType: 'blob' }),

  // Fee Management
  getFeeStructures: (params = {}) => api.get('/admin-staff/fee-structure', { params }).then(res => res.data),
  configureFeeStructure: (data) => api.post('/admin-staff/fee-structure/approval', data),
  updateFeeStructure: (id, data) => api.post('/admin-staff/fee-structure', { ...data, id }),
  deleteFeeStructure: (id) => api.delete(`/admin-staff/fee-structure/${id}`),
  generateFeeReport: (params = {}) => api.get('/admin-staff/reports/fee-collection', {
    params: { ...params, format: 'pdf' },
    responseType: 'blob'
  }),
  // New helper to fetch payments (fee collection)
  getPayments: (params = {}) => api.get('/admin-staff/fee-payments/public', { params }).then(res => res.data),

  // System Settings
  updateSchoolInfo: (data) => api.put('/admin-staff/configuration/school-info', data),
  getSchoolInfo: () => api.get('/admin-staff/configuration/school-info'),
  configureTimetable: (data) => api.post('/admin-staff/configuration/timetable', data),
  getTimetable: (params) => api.get('/admin-staff/configuration/timetable', { params }),

  // User Management
  createUser: (payload) => {
    const role = (payload.role || '').toLowerCase();
    let endpoint = '/admin-staff/staff';

    // Prepare data according to role
    let dataToSend = { ...payload };

    if (role === 'student') {
      endpoint = '/admin-staff/students';
      dataToSend = {
        name: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
        rollNumber: payload.admissionNumber || `RN-${Date.now().toString(36)}`,
        class: payload.classId || 'Unknown',
        section: payload.section || 'A',
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        email: payload.email,
        contactNumber: payload.phone,
        status: payload.status,
      };
    } else if (role === 'parent') {
      endpoint = '/admin-staff/parents';
      dataToSend = {
        name: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
        email: payload.email,
        password: payload.password || 'defaultPassword123', // Generate default password if not provided
        contactNumber: payload.phone || payload.contactNumber,
        address: {
          street: payload.address?.street || '',
          city: payload.address?.city || '',
          state: payload.address?.state || '',
          postalCode: payload.address?.postalCode || '',
          country: payload.address?.country || ''
        },
        childRollNumbers: payload.childRollNumbers || []
      };
    } else if (role === 'teacher') {
        dataToSend.role = 'Teacher';
    } else if (role === 'accountant') {
      dataToSend.role = 'Accountant';
      } else {
        dataToSend.role = 'AdminStaff';
    }

    return api.post(endpoint, dataToSend);
  },
  getAllUsers: (params) => api.get('/admin-staff/staff', { params }).then(res=>res.data),
  updateUser: (userId, payload) => {
    const role = (payload.role || '').toLowerCase();
    let endpoint = `/admin-staff/staff/${userId}`;

    let dataToSend = { ...payload };

    if (role === 'student') {
      endpoint = `/admin-staff/students/${userId}`;
      dataToSend = {
        name: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
        rollNumber: payload.admissionNumber || `RN-${Date.now().toString(36)}`,
        class: payload.classId || 'Unknown',
        section: payload.section || 'A',
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        email: payload.email,
        contactNumber: payload.phone,
        status: payload.status,
      };
    } else if (role === 'parent') {
      endpoint = `/admin-staff/parents/${userId}`;
      dataToSend = {
        name: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
        email: payload.email,
        contactNumber: payload.phone || payload.contactNumber,
        address: {
          street: payload.address?.street || '',
          city: payload.address?.city || '',
          state: payload.address?.state || '',
          postalCode: payload.address?.postalCode || '',
          country: payload.address?.country || ''
        },
        childRollNumbers: payload.childRollNumbers || []
      };
    } else if (role === 'teacher') {
        dataToSend.role = 'Teacher';
    } else if (role === 'accountant') {
      dataToSend.role = 'Accountant';
      } else {
        dataToSend.role = 'AdminStaff';
    }

    return api.put(endpoint, dataToSend);
  },
  deleteUser: (userId, role='staff') => {
    const r = role.toLowerCase();
    let endpoint = `/admin-staff/staff/${userId}`;
    if (r === 'student') endpoint = `/admin-staff/students/${userId}`;
    else if (r === 'parent') endpoint = `/admin-staff/parents/${userId}`;
    return api.delete(endpoint);
  },
  resetUserPassword: (userId, role='staff') => {
    const r = role.toLowerCase();
    let endpoint = `/admin-staff/staff/${userId}/reset-password`;
    if (r === 'student') endpoint = `/admin-staff/students/${userId}/reset-password`;
    else if (r === 'parent') endpoint = `/admin-staff/parents/${userId}/reset-password`;
    return api.post(endpoint);
  },

  // Reports
  generateAttendanceReport: (params) => api.get('/admin-staff/reports/attendance', { params }),
  generateAcademicReport: (params) => api.get('/admin-staff/reports/academic', { params }),
  generateFinancialReport: (params) => api.get('/admin-staff/reports/financial', { params }),

  // Inventory Management
  getInventory: () => api.get('/admin-staff/inventory').then(res=>res.data),
  createInventoryItem: (data) => api.post('/admin-staff/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/admin-staff/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/admin-staff/inventory/${id}`),
  exportInventory: () => api.get('/admin-staff/inventory/export', { responseType: 'blob' }),

  // Transport Form Management
  getTransportForms: (params) => api.get('/transport-forms/admin', { params }).then(res => res.data),
  getTransportFormById: (formId) => api.get(`/transport-forms/admin/${formId}`).then(res => res.data),
  createTransportForm: (formData) => api.post('/transport-forms', formData).then(res => res.data),
  updateTransportForm: (formId, formData) => api.put(`/transport-forms/admin/${formId}`, formData).then(res => res.data),
  deleteTransportForm: (formId) => api.delete(`/transport-forms/admin/${formId}`).then(res => res.data),
  getTransportFormStats: (params) => api.get('/transport-forms/admin/stats', { params }).then(res => res.data),
  downloadTransportFormPDF: (formId) => api.get(`/transport-forms/admin/${formId}/download`, { 
    responseType: 'blob' 
  }).then(res => res.data),
  generateTransportFormPDF: (formId) => api.post(`/transport-forms/admin/${formId}/generate-pdf`).then(res => res.data),

  // Permissions Management
  getAllStaffPermissions: () =>
    api.get('/admin/permissions/staff')
      .then(res => {
        // If the response is HTML, log and throw an error
        if (typeof res.data === 'string' && res.data.startsWith('<!doctype html')) {
          console.error('❌ Received HTML instead of JSON from /admin/permissions/staff:', res.data);
          throw new Error('Received HTML instead of JSON from /admin/permissions/staff. Check backend or proxy config.');
        }
        // Log the raw response for debugging
        console.log('Raw /admin/permissions/staff response:', res.data);
        return res.data.data || [];
      }),
  getStaffPermissions: (staffId) => api.get(`/admin/permissions/${staffId}`).then(res => res.data.data),
  assignRoleAndPermissions: (staffId, data) => api.post(`/admin/permissions/${staffId}/assign`, data).then(res => res.data),
  updateStaffPermissions: (staffId, data) => api.put(`/admin/permissions/${staffId}`, data).then(res => res.data),
  removeStaffPermissions: (staffId) => api.delete(`/admin/permissions/${staffId}`).then(res => res.data),
  getAvailableRoles: () => api.get('/admin/permissions/roles').then(res => res.data.data || []),
  getPermissionSummary: () => api.get('/admin/permissions/summary').then(res => res.data.data || []),
  bulkAssignPermissions: (data) => api.post('/admin/permissions/bulk-assign', data).then(res => res.data),

  // Supplier Management
  getSuppliers: () => api.get('/admin-staff/suppliers').then(res=>res.data),
  addSupplier: (data) => api.post('/admin-staff/suppliers', data).then(res=>res.data),
  updateSupplier: (id, data) => api.put(`/admin-staff/suppliers/${id}`, data).then(res=>res.data),
  deleteSupplier: (id) => api.delete(`/admin-staff/suppliers/${id}`),
  
  // Supply Requests
  getSupplyRequests: () => api.get('/admin-staff/supply-requests').then(res=>res.data),
  createSupplyRequest: (data) => api.post('/admin-staff/supply-requests', data).then(res=>res.data),
  updateSupplyRequestStatus: (id, status) => api.put(`/admin-staff/supply-requests/${id}/status`, { status }).then(res=>res.data),
  deleteSupplyRequest: (id) => api.delete(`/admin-staff/supply-requests/${id}`),

  // Enquiry Management
  getEnquiries: (params) => api.get('/admin-staff/enquiries', { params }),
  createEnquiry: (data) => api.post('/admin-staff/enquiries', data),
  updateEnquiry: (id, data) => {
    // Determine which endpoint to use based on the data
    if (data.status) {
      return api.put(`/admin-staff/enquiries/${id}/status`, data);
    } else if (data.reply) {
      return api.put(`/admin-staff/enquiries/${id}/reply`, data);
    } else {
      // Fallback to status endpoint for general updates
      return api.put(`/admin-staff/enquiries/${id}/status`, data);
    }
  },
  getEnquiryStats: () => api.get('/admin-staff/enquiries/stats'),
  bulkImportEnquiries: (enquiries, config) => api.post('/admin-staff/enquiries/bulk', { enquiries }, config),

  // Supplier Request Management
  getSupplierRequests: (params) => api.get('/admin-staff/supplier-requests', { params }),
  getSupplierRequestById: (id) => api.get(`/admin-staff/supplier-requests/${id}`),
  createSupplierRequest: (data) => api.post('/admin-staff/supplier-requests', data),
  updateSupplierRequest: (id, data) => api.put(`/admin-staff/supplier-requests/${id}`, data),
  deleteSupplierRequest: (id) => api.delete(`/admin-staff/supplier-requests/${id}`),
  addSupplierRequestNote: (id, data) => api.post(`/admin-staff/supplier-requests/${id}/notes`, data),
  getSupplierRequestStats: () => api.get('/admin-staff/supplier-requests/stats'),
  submitSupplierRequest: (id) => api.post(`/admin-staff/supplier-requests/${id}/submit`),

  // Event Management
  getEvents: () => api.get('/admin-staff/calendar').then(res=>{
    // Normalize event fields for the frontend table (A_Events)
    const mapEvent = (ev)=>{
      const start = ev.startDate ? new Date(ev.startDate) : null;
      const end = ev.endDate ? new Date(ev.endDate) : null;
      return {
        ...ev,
        id: ev._id || ev.id,
        date: start ? start.toISOString().slice(0,10) : '',
        startTime: start ? start.toISOString().slice(11,16) : '',
        endTime: end ? end.toISOString().slice(11,16) : '',
        location: ev.venue || ev.location,
        type: ev.eventType || ev.type,
      };
    };
    const events = Array.isArray(res.data) ? res.data.map(mapEvent) : [];
    return events;
  }),
  createEvent: (formData) => {
    const {
      date,
      startTime,
      endTime,
      location,
      type,
      ...rest
    } = formData;

    const buildDateTime = (d, t, fallbackTime) => {
      if (!d) return undefined;
      const timePart = t || fallbackTime;
      return new Date(`${d}T${timePart}`).toISOString();
    };

    const payload = {
      ...rest,
      eventType: type ? (type.charAt(0).toUpperCase() + type.slice(1)) : rest.eventType,
      startDate: buildDateTime(date, startTime, '00:00'),
      endDate: buildDateTime(date, endTime, '23:59'),
      location,
    };

    return api.post('/admin-staff/calendar', payload);
  },
  createEventApproval: (formData) => {
    const {
      date,
      startTime,
      endTime,
      location,
      type,
      title,
      description,
      organizer,
      participants
    } = formData;

    const buildDateTime = (d, t, fallbackTime) => {
      if (!d) return undefined;
      const timePart = t || fallbackTime;
      return new Date(`${d}T${timePart}`).toISOString();
    };

    // Set default date to today if not provided
    const eventDate = date || new Date().toISOString().split('T')[0];
    const eventStartTime = startTime || '09:00';
    const eventEndTime = endTime || '10:00';

    const payload = {
      title: title || 'New Event', // Ensure title is provided
      description: description || 'Event description', // Ensure description is provided
      requestType: 'Event',
      currentApprover: 'Principal',
      status: 'Pending',
      requestData: {
        title: title || 'New Event',
        description: description || 'Event description',
        eventType: type ? (type.charAt(0).toUpperCase() + type.slice(1)) : 'Event',
        startDate: buildDateTime(eventDate, eventStartTime, '09:00'),
        endDate: buildDateTime(eventDate, eventEndTime, '10:00'),
        location: location || 'TBD',
        organizer: organizer || 'School Administration',
        participants: participants || [],
        venue: location || 'TBD', // Map location to venue for Event model
        audience: ['All'], // Default audience
        // Don't include ...rest here to avoid double nesting
      }
    };

    return api.post('/admin-staff/approvals', payload);
  },
  updateEvent: (id, formData) => {
    const {
      date,
      startTime,
      endTime,
      location,
      type,
      ...rest
    } = formData;

    const buildDateTime = (d, t, fallbackTime) => {
      if (!d) return undefined;
      const timePart = t || fallbackTime;
      return new Date(`${d}T${timePart}`).toISOString();
    };

    const payload = {
      ...rest,
      eventType: type ? (type.charAt(0).toUpperCase() + type.slice(1)) : rest.eventType,
      startDate: buildDateTime(date, startTime, '00:00'),
      endDate: buildDateTime(date, endTime, '23:59'),
      location,
    };

    return api.put(`/admin-staff/calendar/${id}`, payload);
  },
  deleteEvent: (id) => api.delete(`/admin-staff/calendar/${id}`),
  getEvent: (id) => api.get(`/admin-staff/calendar/${id}`),

  // Communication Management
  getCommunications: () => api.get('/admin-staff/communications').then(res=>{
    const mapComm = (c)=>({
      ...c,
      id: c._id || c.id,
      title: c.subject,
      type: c.communicationType,
      startDate: c.scheduledDate || c.startDate,
      endDate: c.endDate || c.scheduledDate,
      targetAudience: Array.isArray(c.recipients) && c.recipients.length>0 ? c.recipients.join(', ') : 'All',
    });
    return Array.isArray(res.data) ? res.data.map(mapComm) : [];
  }),
  createCommunication: (formData) => {
    // UI uses `title`, `content`, `type`, `targetAudience` etc.
    // Backend expects `subject`, `content`, `communicationType`, `recipients`.
    const {
      title,
      content,
      type,
      targetAudience,
      startDate,
      endDate,
      priority,
      ...rest
    } = formData;

    const mapAudience = (aud) => {
      if (!aud) return 'All Students';
      const val = aud.toLowerCase();
      switch (val) {
        case 'all':
        case 'students':
          return 'All Students';
        case 'staff':
          return 'All Staff';
        case 'parents':
          return 'All Parents';
        case 'class':
          return 'Specific Class';
        case 'department':
          return 'Specific Department';
        default:
          return 'Custom';
      }
    };

    const payload = {
      subject: title,
      content,
      communicationType: type || 'Announcement',
      recipients: [mapAudience(targetAudience)],
      scheduledDate: startDate || new Date(),
      endDate,
      priority,
      ...rest,
    };

    return api.post('/admin-staff/communications', payload);
  },
  createCommunicationApproval: (formData) => {
    // UI uses `title`, `content`, `type`, `targetAudience` etc.
    // Backend expects `subject`, `content`, `communicationType`, `recipients`.
    const {
      title,
      content,
      type,
      targetAudience,
      startDate,
      endDate,
      priority,
      ...rest
    } = formData;

    const mapAudience = (aud) => {
      if (!aud) return 'All Students';
      const val = aud.toLowerCase();
      switch (val) {
        case 'all':
        case 'students':
          return 'All Students';
        case 'staff':
          return 'All Staff';
        case 'parents':
          return 'All Parents';
        case 'class':
          return 'Specific Class';
        case 'department':
          return 'Specific Department';
        default:
          return 'Custom';
      }
    };

    const payload = {
      title: title || 'New Communication', // Ensure title is provided
      description: content || 'Communication content', // Ensure description is provided
      requestType: 'Communication',
      currentApprover: 'Principal',
      status: 'Pending',
      requestData: {
        subject: title || 'New Communication',
        content: content || 'Communication content',
        communicationType: type || 'Announcement',
        recipients: [mapAudience(targetAudience)],
        scheduledDate: startDate || new Date(),
        endDate,
        priority,
        ...rest,
      }
    };

    return api.post('/admin-staff/approvals', payload);
  },
  updateCommunication: (id, formData) => {
    const {
      title,
      content,
      type,
      targetAudience,
      startDate,
      endDate,
      priority,
      ...rest
    } = formData;

    const mapAudience = (aud) => {
      if (!aud) return 'All Students';
      const val = aud.toLowerCase();
      switch (val) {
        case 'all':
        case 'students':
          return 'All Students';
        case 'staff':
          return 'All Staff';
        case 'parents':
          return 'All Parents';
        case 'class':
          return 'Specific Class';
        case 'department':
          return 'Specific Department';
        default:
          return 'Custom';
      }
    };

    const payload = {
      subject: title,
      content,
      communicationType: type || 'Announcement',
      recipients: [mapAudience(targetAudience)],
      scheduledDate: startDate || new Date(),
      endDate,
      priority,
      ...rest,
    };

    return api.put(`/admin-staff/communications/${id}`, payload);
  },
  updateCommunicationStatus: (id,data) => api.put(`/admin-staff/communications/${id}/status`, data),

  // Approval Management
  getApprovalRequests: (params = {}) => api.get('/admin-staff/approvals', { params }).then(res => res.data),
  createApprovalRequest: (data) => api.post('/admin-staff/approvals', data),
  updateApprovalRequest: (id, data) => api.put(`/admin-staff/approvals/${id}`, data),
  deleteApprovalRequest: (id) => api.delete(`/admin-staff/approvals/${id}`),

  // Class Management
  getClasses: () => api.get('/admin-staff/classes').then(res=>{
    const mapClass = (c)=>({
      ...c,
      id: c._id || c.id,
      coordinator: c.coordinator || c.coordinatorId,
    });
    return Array.isArray(res.data) ? res.data.map(mapClass) : [];
  }),
  createClass: (data) => api.post('/admin-staff/classes', data),
  updateClass: (id,data) => api.put(`/admin-staff/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/admin-staff/classes/${id}`),
  getTeachers: () => api.get('/admin-staff/staff/teachers/public').then(res => res.data),

  // Subject Management
  getSubjects: () => api.get('/admin-staff/subjects').then(res=>{
    const mapSubject = (s)=>({
      ...s,
      id: s._id || s.id,
      classId: s.class || s.classId,
      teacherId: s.teacher || s.teacherId,
    });
    return Array.isArray(res.data) ? res.data.map(mapSubject) : [];
  }),
  createSubject: (data) => api.post('/admin-staff/subjects', data),
  updateSubject: (id,data) => api.put(`/admin-staff/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin-staff/subjects/${id}`),

  // Schedule Management
  getSchedules: () => api.get('/admin-staff/schedules').then(res=>res.data),
  createSchedule: (data)=>api.post('/admin-staff/schedules', data),
  updateSchedule:(id,data)=>api.put(`/admin-staff/schedules/${id}`,data),
  deleteSchedule:(id)=>api.delete(`/admin-staff/schedules/${id}`),

  // Visitor Management
  getVisitors: () => api.get('/admin-staff/visitors').then(res => res.data),
  addVisitor: (data) => api.post('/admin-staff/visitors', data),
  updateVisitorExit: (id, data={}) => api.put(`/admin-staff/visitors/${id}/exit`, data),
  bulkImportVisitors: (visitors, config) => api.post('/admin-staff/visitors/bulk', { visitors }, config),

  // Add new minimal API for saving staff roles and access
  saveStaffRolesAndAccess: (staffId, data) => api.put(`/admin/permissions/${staffId}`, data).then(res => res.data),
  
  // Service Request Management
  getServiceRequests: () => api.get('/admin-staff/service-requests').then(res => res.data),
  createServiceRequest: (data) => api.post('/admin-staff/service-requests', data).then(res => res.data),
  updateServiceRequest: (id, data) => api.put(`/admin-staff/service-requests/${id}`, data).then(res => res.data),
  deleteServiceRequest: (id) => api.delete(`/admin-staff/service-requests/${id}`).then(res => res.data),
};

// Teacher API functions
export const teacherAPI = {
  // Profile Management - Updated to use staff endpoints with staffId
  getProfile: (staffId) => api.get(`/staffs/${staffId}/profile`).then(res => res.data),
  updateProfile: (staffId, data) => api.put(`/staffs/${staffId}/profile`, data).then(res => res.data),
  changePassword: (data) => api.put('/staffs/change-password', data).then(res => res.data),
  uploadProfileImage: (formData) => api.put('/staffs/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  
  // Professional Development Management
  addProfessionalDevelopment: (data) => api.post('/staffs/professional-development', data).then(res => res.data),
  updateProfessionalDevelopment: (index, data) => api.put(`/staffs/professional-development/${index}`, data).then(res => res.data),
  deleteProfessionalDevelopment: (index) => api.delete(`/staffs/professional-development/${index}`).then(res => res.data),
  
  // Get public profile of another staff member
  getPublicProfile: (staffId) => api.get(`/staffs/profile/${staffId}`).then(res => res.data),

  // Class and Subject Management - Updated with staffId
  getClasses: (staffId) => api.get(`/staffs/${staffId}/coordinated-classes`).then(res => res.data),
  getStudents: (staffId) => api.get(`/staffs/${staffId}/coordinated-students`).then(res => res.data),
  getAssignedStudents: (staffId) => api.get(`/staffs/${staffId}/coordinated-students`).then(res => res.data),
  getCoordinatedStudents: (staffId) => api.get(`/staffs/${staffId}/coordinated-students`).then(res => res.data),
  getCoordinatedParents: (staffId) => api.get(`/staffs/${staffId}/coordinated-parents`).then(res => res.data),
  getClassDetails: (classId) => api.get(`/staffs/classes/${classId}`).then(res => res.data),
  createClass: (data) => api.post('/staffs/classes', data).then(res => res.data),
  updateClass: (classId, data) => api.put(`/staffs/classes/${classId}`, data).then(res => res.data),
  deleteClass: (classId) => api.delete(`/staffs/classes/${classId}`).then(res => res.data),
  saveAttendance: (classId, data) => api.post(`/staffs/classes/${classId}/attendance`, data).then(res => res.data),

  // Timetable
  getTimetable: () => api.get('/teachers/timetable').then(res => res.data),
  addTimetableEntry: (data) => api.post('/teachers/timetable', data).then(res => res.data),
  updateTimetableEntry: (entryId, data) => api.put(`/teachers/timetable/${entryId}`, data).then(res => res.data),
  deleteTimetableEntry: (entryId) => api.delete(`/teachers/timetable/${entryId}`).then(res => res.data),
  requestSubstitution: (data) => api.post('/teachers/substitution-requests', data).then(res => res.data),
  getSubstitutionRequests: () => api.get('/teachers/substitution-requests').then(res => res.data),
  getAcademicCalendar: () => api.get('/teachers/academic-calendar').then(res => res.data),
  getCalendarEvents: () => api.get('/teachers/calendar-events').then(res => res.data),
  createEvent: (data) => api.post('/teachers/events', data).then(res => res.data),
  updateEvent: (eventId, data) => api.put(`/teachers/events/${eventId}`, data).then(res => res.data),
  deleteEvent: (eventId) => api.delete(`/teachers/events/${eventId}`).then(res => res.data),

  // Attendance Management
  markAttendance: (data) => api.post('/teachers/attendance', data).then(res => res.data),
  getAttendance: () => api.get('/teachers/attendance').then(res => res.data),
  getMarkedAttendance: () => api.get('/teachers/attendance').then(res => res.data),
  getClassAttendance: (classId) => api.get(`/teachers/attendance/${classId}`).then(res => res.data),
  createAttendance: (data) => api.post('/teachers/attendance', data).then(res => res.data),
  updateAttendance: (attendanceId, data) => api.put(`/teachers/attendance/${attendanceId}`, data).then(res => res.data),
  
  // Enhanced Attendance Management
  markClassAttendance: (data) => api.post('/teachers/attendance', data).then(res => res.data),
  getClassAttendanceByDate: (className, section, date) => api.get(`/teachers/attendance/${className}/${section}/${date}`).then(res => res.data),
  generateAttendanceReport: (className, section, startDate, endDate) => api.get(`/teachers/attendance-report/${className}/${section}/${startDate}/${endDate}`).then(res => res.data),
  getStudentsByClass: (className, section) => api.get(`/teachers/students/${className}/${section}`).then(res => res.data),
  exportAttendanceCSV: (className, section, startDate, endDate) => api.get(`/teachers/attendance-report/${className}/${section}/${startDate}/${endDate}?format=csv`, { responseType: 'blob' }),

  // Assignment Management
  createAssignment: (data) => api.post('/teachers/assignments', data).then(res => res.data),
  getAssignments: () => api.get('/teachers/assignments').then(res => res.data),
  getAssignmentDetails: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}`).then(res => res.data),
  updateAssignment: (assignmentId, data) => api.put(`/teachers/assignments/${assignmentId}`, data).then(res => res.data),
  deleteAssignment: (assignmentId) => api.delete(`/teachers/assignments/${assignmentId}`).then(res => res.data),
  getSubmissions: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/submissions`).then(res => res.data),
  gradeSubmission: (submissionId, data) => api.put(`/teachers/submissions/${submissionId}/grade`, data).then(res => res.data),

  // MCQ Assignment Management
  createMCQAssignment: (data) => api.post('/teachers/mcq-assignments', data).then(res => res.data),
  getMCQAssignments: () => api.get('/teachers/mcq-assignments').then(res => res.data),
  getMCQAssignmentDetails: (assignmentId) => api.get(`/teachers/mcq-assignments/${assignmentId}`).then(res => res.data),
  updateMCQAssignment: (assignmentId, data) => api.put(`/teachers/mcq-assignments/${assignmentId}`, data).then(res => res.data),
  deleteMCQAssignment: (assignmentId) => api.delete(`/teachers/mcq-assignments/${assignmentId}`).then(res => res.data),
  getMCQSubmissions: (assignmentId) => api.get(`/teachers/mcq-assignments/${assignmentId}/submissions`).then(res => res.data),

  // Exam Management
  createExam: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'questionPaper' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/teachers/exams', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getExams: () => api.get('/teachers/exams').then(res => res.data),
  getExamResults: (examId) => api.get(`/teachers/exams/${examId}/results`).then(res => res.data),
  enterExamResults: (examId, data) => api.post(`/teachers/exams/${examId}/results`, data).then(res => res.data),
  generatePerformanceReport: (examId) => api.get(`/teachers/exams/${examId}/performance-report`).then(res => res.data),
  updateExam: (examId, data) => api.put(`/teachers/exams/${examId}`, data).then(res => res.data),
  deleteExam: (examId) => api.delete(`/teachers/exams/${examId}`).then(res => res.data),
  gradeExam: (resultId, data) => api.put(`/teachers/exam-results/${resultId}`, data).then(res => res.data),

  // Learning Materials
  getLessonPlanOptions: () => api.get('/teachers/lesson-plan-options').then(res => res.data),
  submitLessonPlan: (data) => {
    // Check if data is FormData (for file uploads) or regular object
    if (data instanceof FormData) {
      return api.post('/teachers/lesson-plans', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data);
    } else {
      return api.post('/teachers/lesson-plans', data).then(res => res.data);
    }
  },
  getLessonPlans: () => api.get('/teachers/lesson-plans').then(res => res.data),
  uploadResource: (data) => api.post('/teachers/resources', data).then(res => res.data),
  getResources: () => api.get('/teachers/resources').then(res => res.data),
  getDepartmentalResources: () => api.get('/teachers/departmental-resources').then(res => res.data),
  getLearningResources: () => api.get('/teachers/resources').then(res => res.data),
  createResource: (data) => api.post('/teachers/resources', data).then(res => res.data),
  updateResource: (resourceId, data) => api.put(`/teachers/resources/${resourceId}`, data).then(res => res.data),
  deleteResource: (resourceId) => api.delete(`/teachers/resources/${resourceId}`).then(res => res.data),

  // Communication
  sendMessage: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachments' && Array.isArray(data[key])) {
        data[key].forEach(file => formData.append('attachments', file));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/teachers/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getReceivedMessages: () => api.get('/teachers/messages/received').then(res => res.data),
  getSentMessages: () => api.get('/teachers/messages/sent').then(res => res.data),
  getMessages: () => api.get('/teachers/messages').then(res => res.data),
  replyToMessage: (messageId, data) => api.post(`/teachers/messages/${messageId}/reply`, data).then(res => res.data),
  postAnnouncement: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachments' && Array.isArray(data[key])) {
        data[key].forEach(file => formData.append('attachments', file));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/teachers/announcements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getAnnouncements: () => api.get('/teachers/announcements').then(res => res.data),
  createAnnouncement: (data) => api.post('/teachers/announcements', data).then(res => res.data),
  updateAnnouncement: (announcementId, data) => api.put(`/teachers/announcements/${announcementId}`, data).then(res => res.data),
  deleteAnnouncement: (announcementId) => api.delete(`/teachers/announcements/${announcementId}`).then(res => res.data),
  scheduleMeeting: (data) => api.post('/teachers/meetings', data).then(res => res.data),
  getMeetings: () => api.get('/teachers/meetings').then(res => res.data),

  // Student Performance
  recordPerformance: (data) => api.post('/teachers/student-performance', data).then(res => res.data),
  getStudentPerformance: (studentId, subject = null) => {
    const url = subject 
      ? `/teachers/student-performance/${studentId}/subject/${subject}`
      : `/teachers/student-performance/${studentId}`;
    return api.get(url).then(res => res.data);
  },
  addBehavioralObservation: (studentId, data) => api.post(`/teachers/student-performance/${studentId}/observations`, data).then(res => res.data),
  createInterventionPlan: (studentId, data) => api.post(`/teachers/student-performance/${studentId}/intervention-plan`, data).then(res => res.data),

  // Projects and Activities
  createProject: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachment' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/teachers/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getProjects: () => api.get('/teachers/projects').then(res => res.data),
  getProjectDetails: (projectId) => api.get(`/teachers/projects/${projectId}`).then(res => res.data),
  updateProject: (projectId, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachment' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/teachers/projects/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  recordStudentContribution: (projectId, data) => api.post(`/teachers/projects/${projectId}/student-contributions`, data).then(res => res.data),
  getStudentContributions: (projectId) => api.get(`/teachers/projects/${projectId}/student-contributions`).then(res => res.data),
  recordExtracurricularAchievement: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'certificate' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/teachers/extracurricular-achievements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  // Parent Interaction
  getParentMeetings: () => api.get('/teachers/parent-meetings').then(res => res.data),
  recordCommunication: (data) => api.post('/teachers/parent-communications', data).then(res => res.data),
  getCommunicationHistory: (parentId) => api.get(`/teachers/parent-communications/${parentId}`).then(res => res.data),
  documentConcern: (data) => api.post('/teachers/parent-concerns', data).then(res => res.data),
  addFollowUp: (concernId, data) => api.put(`/teachers/parent-concerns/${concernId}/follow-up`, data).then(res => res.data),
  sendProgressUpdate: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachment' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/teachers/progress-updates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  // Feedback System
  submitSuggestion: (data) => api.post('/teachers/academic-suggestions', data).then(res => res.data),
  requestResource: (data) => api.post('/teachers/resource-requests', data).then(res => res.data),
  getResourceRequests: () => api.get('/teachers/resource-requests').then(res => res.data),
  provideCurriculumFeedback: (data) => api.post('/teachers/curriculum-feedback', data).then(res => res.data),
  getCurriculumFeedback: () => api.get('/teachers/curriculum-feedback').then(res => res.data),

  // Leave Request Management - Updated with staffId
  getLeaveRequests: (staffId) => api.get(`/staffs/${staffId}/leave-requests`).then(res => res.data),

  updateLeaveRequest: (staffId, leaveId, data) => api.put(`/staffs/${staffId}/leave-requests/${leaveId}`, data).then(res => res.data),
  
  // Teacher's Own Leave Request Management
  submitMyLeaveRequest: (data) => api.post('/teachers/leave-requests', data).then(res => res.data),
  getMyLeaveRequests: () => api.get('/teachers/leave-requests').then(res => res.data),
  getMyLeaveRequestById: (requestId) => api.get(`/teachers/leave-requests/${requestId}`).then(res => res.data),
  cancelMyLeaveRequest: (requestId) => api.put(`/teachers/leave-requests/${requestId}/cancel`).then(res => res.data),
  getMyLeaveStatistics: () => api.get('/teachers/leave-requests/stats/statistics').then(res => res.data),
  
  // Student Attendance Management
  getStudentAttendancePercentage: (staffId, studentId) => api.get(`/staffs/${staffId}/students/${studentId}/attendance`).then(res => res.data),
  
  // VP Exam Management - For viewing VP-scheduled exams
  getVPExams: (staffId) => api.get(`/staffs/${staffId}/published-exams`).then(res => res.data),
  getVPExamsByGrade: (staffId, grade) => api.get(`/staffs/${staffId}/published-exams?grade=${grade}`).then(res => res.data),
  getVPExamsBySubject: (staffId, subject) => api.get(`/staffs/${staffId}/published-exams?subject=${subject}`).then(res => res.data),
  getVPExamsFiltered: (staffId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.grade && filters.grade !== 'all') params.append('grade', filters.grade);
    if (filters.subject && filters.subject !== 'all') params.append('subject', filters.subject);
    return api.get(`/staffs/${staffId}/published-examinations?${params.toString()}`).then(res => res.data);
  },

  // Counselling Request Management
  createCounsellingRequest: (data) => api.post('/counselling-requests', data).then(res => res.data),
  getCounsellingRequests: (params) => api.get('/counselling-requests', { params }).then(res => res.data),
  getCounsellingRequestStats: (params) => api.get('/counselling-requests/stats', { params }).then(res => res.data),

  // IT Support Request Management
  createITSupportRequest: (data) => api.post('/teachers/it-support-requests', data).then(res => res.data),
  getITSupportRequests: (params) => api.get('/teachers/it-support-requests', { params }).then(res => res.data),
  getITSupportRequestStats: (params) => api.get('/teachers/it-support-requests/stats', { params }).then(res => res.data),
  getITSupportRequestById: (requestId) => api.get(`/teachers/it-support-requests/${requestId}`).then(res => res.data),
  updateITSupportRequest: (requestId, data) => api.put(`/teachers/it-support-requests/${requestId}`, data).then(res => res.data),
  deleteITSupportRequest: (requestId) => api.delete(`/teachers/it-support-requests/${requestId}`).then(res => res.data),

  // General Service Request Management
  createGeneralServiceRequest: (data) => api.post('/teachers/general-service-requests', data).then(res => res.data),
  getGeneralServiceRequests: (params) => api.get('/teachers/general-service-requests', { params }).then(res => res.data),
  getGeneralServiceRequestStats: (params) => api.get('/teachers/general-service-requests/stats', { params }).then(res => res.data),
  getGeneralServiceRequestById: (requestId) => api.get(`/teachers/general-service-requests/${requestId}`).then(res => res.data),
  updateGeneralServiceRequest: (requestId, data) => api.put(`/teachers/general-service-requests/${requestId}`, data).then(res => res.data),
  deleteGeneralServiceRequest: (requestId) => api.delete(`/teachers/general-service-requests/${requestId}`).then(res => res.data),
};

// HOD endpoints
export const hodAPI = {
  // Dashboard
  getDashboard: () => api.get('/hod/dashboard'),
  
  // Course Management
  getCourses: () => api.get('/hod/courses'),
  createCourse: (data) => api.post('/hod/courses', data),
  updateCourse: (courseId, data) => api.put(`/hod/courses/${courseId}`, data),
  deleteCourse: (courseId) => api.delete(`/hod/courses/${courseId}`),
  getCourseDetails: (courseId) => api.get(`/hod/courses/${courseId}`),
  getCourseAssignments: (courseId) => api.get(`/hod/courses/${courseId}/assignments`),
  
  // Staff Management
  getStaff: () => api.get('/hod/staff'),
  getStaffDetails: (staffId) => api.get(`/hod/staff/${staffId}`),
  createStaff: (data) => api.post('/hod/staff', data),
  updateStaff: (staffId, data) => api.put(`/hod/staff/${staffId}`, data),
  deleteStaff: (staffId) => api.delete(`/hod/staff/${staffId}`),
  assignStaffToCourse: (courseId, staffId) => 
    api.post(`/hod/courses/${courseId}/staff/${staffId}`),
  removeStaffFromCourse: (courseId, staffId) => 
    api.delete(`/hod/courses/${courseId}/staff/${staffId}`),
  
  // Department Management
  getDepartmentInfo: () => api.get('/hod/department'),
  updateDepartmentInfo: (data) => api.put('/hod/department', data),
  getDepartmentStats: () => api.get('/hod/department/stats'),
  getDepartments: () => api.get('/hod/departments'),
  
  // Reports
  generateCourseReport: (courseId, params) => 
    api.get(`/hod/courses/${courseId}/reports`, { params }),
  generateStaffReport: (params) => 
    api.get('/hod/staff/reports', { params }),
  generateDepartmentReport: (params) => 
    api.get('/hod/department/reports', { params }),
  
  // Profile Management
  getProfile: () => api.get('/hod/profile'),
  updateProfile: (data) => api.put('/hod/profile', data),
  updatePassword: (data) => api.put('/hod/profile/password', data),
  uploadProfileImage: (formData) => api.post('/hod/profile/image', formData),
  
  // Notifications and Messages
  getNotifications: () => api.get('/hod/notifications'),
  getMessages: () => api.get('/hod/messages'),
  sendMessage: (data) => api.post('/hod/messages', data),
  
  // Lesson Plan Approval
  getLessonPlansForReview: () => api.get('/hod/academic-planning/lesson-plans').then(res => res.data),
  reviewLessonPlan: (planId, data) => api.put(`/hod/academic-planning/lesson-plans/${planId}`, data).then(res => res.data),
  
  // Department Statistics
  getDepartmentStatistics: () => api.get('/hod/department/stats').then(res => res.data),
  getAllStaff: () => api.get('/hod/staff').then(res => res.data),
  getTeacherAttendance: () => api.get('/hod/teacher-attendance').then(res => res.data),
  markAttendance: (data) => api.post('/hod/teacher-attendance', data).then(res => res.data),
  getAllEvaluations: () => api.get('/hod/teacher-evaluations').then(res => res.data),
  createEvaluation: (data) => api.post('/hod/teacher-evaluations', data).then(res => res.data),
  getClassAllocationRecommendations: () => api.get('/hod/class-allocation/recommendations').then(res => res.data),
  allocateClass: (allocationData) => api.post('/hod/class-allocation', allocationData).then(res => res.data),
  
  // Department Reports
  getPerformanceMetrics: () => api.get('/hod/reports/performance-metrics').then(res => res.data),
  
  // Service Requests Management
  getLeaveRequests: () => api.get('/hod/service-requests/leave').then(res => res.data),
  getITSupportRequests: () => api.get('/hod/service-requests/it-support').then(res => res.data),
  getGeneralServiceRequests: () => api.get('/hod/service-requests/general').then(res => res.data),
  approveServiceRequest: (requestType, requestId, data) => 
    api.put(`/hod/service-requests/${requestType}/${requestId}/approve`, data).then(res => res.data),
  rejectServiceRequest: (requestType, requestId, data) => 
    api.put(`/hod/service-requests/${requestType}/${requestId}/reject`, data).then(res => res.data),
  
  // Teacher Approvals Management
  getTeacherLeaveRequests: () => api.get('/hod/teacher-supervision/leave-requests').then(res => res.data),
  approveTeacherLeaveRequest: (requestId, data) => 
    api.put(`/hod/teacher-supervision/leave-requests/${requestId}/process`, data).then(res => res.data),
  rejectTeacherLeaveRequest: (requestId, data) => 
    api.put(`/hod/teacher-supervision/leave-requests/${requestId}/process`, data).then(res => res.data),
};

// Principal endpoints
export const principalAPI = {
  // Dashboard
  getDashboard: () => api.get('/principal/dashboard'),
  
  // Approval System
  getPendingApprovals: () => api.get('/principal/approvals'),
  getApprovalDetails: (approvalId) => api.get(`/principal/approvals/${approvalId}`),
  approveRequest: (approvalId, data) => api.put(`/principal/approvals/${approvalId}/approve`, data),
  rejectRequest: (approvalId, data) => api.put(`/principal/approvals/${approvalId}/reject`, data),
  getApprovalHistory: (params) => api.get('/principal/approvals/history', { params }),
  getAllApprovals: () => api.get('/principal/approvals/all'),
  
  // Student Management
  getAllStudents: () => api.get('/principal/students'),
  getStudentDetails: (studentId) => api.get(`/principal/students/${studentId}`),
  getStudentAttendance: () => api.get('/principal/students/attendance'),
  getStudentPerformance: () => api.get('/principal/students/performance'),
  
  // Staff Management
  getStaff: () => api.get('/principal/staff'),
  getStaffDetails: (staffId) => api.get(`/principal/staff/${staffId}`),
  getLeaveRequests: () => api.get('/principal/staff/leave-requests'),
  getStaffPerformance: () => api.get('/principal/staff/performance'),
  approveLeaveRequest: (leaveId, data) => api.put(`/principal/staff/leave-requests/${leaveId}/approve`, data),
  rejectLeaveRequest: (leaveId, data) => api.put(`/principal/staff/leave-requests/${leaveId}/reject`, data),
  
  // Admissions
  getAdmissions: () => api.get('/principal/admissions'),
  approveAdmission: (admissionId, data) => api.put(`/principal/admissions/${admissionId}/approve`, data),
  rejectAdmission: (admissionId, data) => api.put(`/principal/admissions/${admissionId}/reject`, data),
  
  // School Management
  getSchoolInfo: () => api.get('/principal/school'),
  updateSchoolInfo: (data) => api.put('/principal/school', data),
  
  // Department Management
  getDepartments: () => api.get('/principal/departments'),
  createDepartment: (data) => api.post('/principal/departments', data),
  updateDepartment: (departmentId, data) => 
    api.put(`/principal/departments/${departmentId}`, data),
  deleteDepartment: (departmentId) => 
    api.delete(`/principal/departments/${departmentId}`),
  getDepartmentDetails: (departmentId) => 
    api.get(`/principal/departments/${departmentId}`),
  
  // Academic Management
  getAcademicYear: () => api.get('/principal/academic-year'),
  updateAcademicYear: (data) => api.put('/principal/academic-year', data),
  getHolidays: () => api.get('/principal/holidays'),
  createHoliday: (data) => api.post('/principal/holidays', data),
  updateHoliday: (holidayId, data) => 
    api.put(`/principal/holidays/${holidayId}`, data),
  deleteHoliday: (holidayId) => 
    api.delete(`/principal/holidays/${holidayId}`),
  getClassCurriculumDetails: (className) => 
    api.get(`/principal/curriculum/${className}`),
  getCurriculumOverview: () => api.get('/principal/curriculum'),
  debugCurriculumData: () => api.get('/principal/curriculum/debug'),
  getAllExaminations: () => api.get('/principal/examinations'),
  getAcademicResults: () => api.get('/principal/results'),
  getAttendanceOverview: () => api.get('/principal/attendance'),
  
  // Reports
  generateSchoolReport: (params) => 
    api.get('/principal/reports/school', { params }),
  generateDepartmentReport: (params) => 
    api.get('/principal/reports/departments', { params }),
  generateStaffReport: (params) => 
    api.get('/principal/reports/staff', { params }),
  
  // Profile Management
  getProfile: () => api.get('/principal/profile'),
  updateProfile: (data) => api.put('/principal/profile', data),
  updatePassword: (data) => api.put('/principal/profile/password', data),
  uploadProfileImage: (formData) => 
    api.post('/principal/profile/image', formData),
  
  // Notifications and Messages
  getNotifications: () => api.get('/principal/notifications'),
  getMessages: () => api.get('/principal/messages'),
  sendMessage: (data) => api.post('/principal/messages', data),
  
  // Lesson Plan Approval
  getLessonPlansForApproval: () => api.get('/principal/lesson-plans/pending').then(res => res.data),
  approveLessonPlan: (planId, data) => api.put(`/principal/lesson-plans/${planId}/approve`, data).then(res => res.data),
  
  // Service Request Management
  getServiceRequests: () => api.get('/principal/service-requests'),
  createServiceRequest: (data) => api.post('/principal/service-requests', data),
  getServiceRequestById: (requestId) => api.get(`/principal/service-requests/${requestId}`),
  updateServiceRequest: (requestId, data) => api.put(`/principal/service-requests/${requestId}`, data),
  deleteServiceRequest: (requestId) => api.delete(`/principal/service-requests/${requestId}`),
  getServiceRequestStats: () => api.get('/principal/service-requests/stats'),
};

export const consentAPI = {
  createTemplate: (eventId, data) => api.post(`/admin-staff/consent-forms/${eventId}`, data).then(res => res.data),
  updateTemplate: (eventId, data) => api.put(`/admin-staff/consent-forms/${eventId}`, data).then(res => res.data),
  getForm: (eventId) => api.get(`/consent-forms/${eventId}`).then(res => res.data),
  parentFill: (eventId, data) => api.put(`/consent-forms/${eventId}/parent`, data).then(res => res.data),
  fixIncompleteForm: (eventId, data) => api.patch(`/consent-forms/${eventId}/fix`, data).then(res => res.data),
};

export const disciplinaryAPI = {
  // Template Management APIs
  getAllTemplates: () => api.get('/disciplinary-templates').then(res => res.data),
  getActiveTemplates: () => api.get('/disciplinary-templates/active').then(res => res.data),
  getDefaultTemplate: () => api.get('/disciplinary-templates/default').then(res => res.data),
  getTemplateById: (templateId) => api.get(`/disciplinary-templates/${templateId}`).then(res => res.data),
  createTemplate: (data) => api.post('/disciplinary-templates', data).then(res => res.data),
  updateTemplate: (templateId, data) => api.put(`/disciplinary-templates/${templateId}`, data).then(res => res.data),
  deleteTemplate: (templateId) => api.delete(`/disciplinary-templates/${templateId}`).then(res => res.data),
  toggleTemplateStatus: (templateId) => api.patch(`/disciplinary-templates/${templateId}/toggle-status`).then(res => res.data),
  setAsDefaultTemplate: (templateId) => api.patch(`/disciplinary-templates/${templateId}/set-default`).then(res => res.data),
  cloneTemplate: (templateId) => api.post(`/disciplinary-templates/${templateId}/clone`).then(res => res.data),
  getTemplateStats: (templateId) => api.get(`/disciplinary-templates/${templateId}/stats`).then(res => res.data),
  
  // Legacy Template APIs (for backward compatibility)
  getTemplate: () => api.get('/disciplinary-forms/template').then(res => res.data),
  
  // Admin APIs
  getAllForms: (params) => api.get('/disciplinary-forms/admin/forms', { params }).then(res => res.data),
  getStats: (params) => api.get('/disciplinary-forms/admin/stats', { params }).then(res => res.data),
  createForm: (data) => api.post('/disciplinary-forms/admin/forms', data).then(res => res.data),
  deleteForm: (formId) => api.delete(`/disciplinary-forms/admin/forms/${formId}`).then(res => res.data),
  
  // Teacher APIs
  createTeacherForm: (data) => api.post('/disciplinary-forms/teacher/forms', data).then(res => res.data),
  getTeacherForms: (params) => api.get('/disciplinary-forms/teacher/forms', { params }).then(res => res.data),
  updateForm: (formId, data) => api.put(`/disciplinary-forms/teacher/forms/${formId}`, data).then(res => res.data),
  submitForm: (formId) => api.post(`/disciplinary-forms/teacher/forms/${formId}/submit`).then(res => res.data),
  
  // Student APIs
  getStudentForms: () => api.get('/disciplinary-forms/student/forms').then(res => res.data),
  studentAcknowledge: (formId, data) => api.post(`/disciplinary-forms/student/forms/${formId}/acknowledge`, data).then(res => res.data),
  
  // Parent APIs
  getParentForms: () => api.get('/disciplinary-forms/parent/forms').then(res => res.data),
  parentAcknowledge: (formId, data) => api.post(`/disciplinary-forms/parent/forms/${formId}/acknowledge`, data).then(res => res.data),
  
  // New Student Disciplinary Misconduct APIs
  getStudentMisconductRecords: () => api.get('/disciplinary-forms/student/misconduct-records').then(res => res.data),
  respondToMisconduct: (actionId, response) => api.post(`/disciplinary-forms/student/misconduct/${actionId}/respond`, { response }).then(res => res.data),
  
  // New Parent Ward Disciplinary Misconduct APIs
  getWardMisconductRecords: () => api.get('/disciplinary-forms/parent/ward-misconduct-records').then(res => res.data),
  respondToWardMisconduct: (studentId, actionId, response) => api.post(`/disciplinary-forms/parent/ward-misconduct/${studentId}/${actionId}/respond`, { response }).then(res => res.data),
  
  // Teacher Class Misconduct Records API
  getClassMisconductRecords: (classname, section) => api.get(`/disciplinary-forms/teacher/class-misconduct-records?classname=${classname}&section=${section}`).then(res => res.data),
  
  // Common APIs
  getFormById: (formId) => api.get(`/disciplinary-forms/forms/${formId}`).then(res => res.data),
  
  // PDF APIs
  downloadFormPDF: (formId) => api.get(`/disciplinary-forms/forms/${formId}/download-pdf`, { 
    responseType: 'blob' 
  }).then(res => res.data),
  generateFormPDF: (formId) => api.post(`/disciplinary-forms/forms/${formId}/generate-pdf`).then(res => res.data),
};

// Transport Form APIs
export const transportAPI = {
  // CRUD operations
  getAllForms: (params = {}) => api.get('/transport-forms/admin', { params }).then(res => res.data),
  getFormById: (formId) => api.get(`/transport-forms/admin/${formId}`).then(res => res.data),
  createForm: (formData) => api.post('/transport-forms', formData).then(res => res.data),
  updateForm: (formId, formData) => api.put(`/transport-forms/admin/${formId}`, formData).then(res => res.data),
  deleteForm: (formId) => api.delete(`/transport-forms/admin/${formId}`).then(res => res.data),
  
  // Status management
  updateFormStatus: (formId, statusData) => api.patch(`/transport-forms/admin/${formId}/status`, statusData).then(res => res.data),
  
  // Statistics
  getFormStats: (period = 'month') => api.get(`/transport-forms/admin/stats?period=${period}`).then(res => res.data),
  
  // PDF operations
  downloadFormPDF: (formId) => api.get(`/transport-forms/admin/${formId}/download`, { 
    responseType: 'blob' 
  }).then(res => res.data),
  generateFormPDF: (formId) => api.post(`/transport-forms/admin/${formId}/generate-pdf`).then(res => res.data),
};

export const syllabusAPI = {
  // Admin APIs
  createEntry: (data) => api.post('/syllabus-completion/admin', data).then(res => res.data),
  getAllEntries: (params) => api.get('/syllabus-completion/admin', { params }).then(res => res.data),
  updateEntry: (id, data) => api.put(`/syllabus-completion/admin/${id}`, data).then(res => res.data),
  deleteEntry: (id) => api.delete(`/syllabus-completion/admin/${id}`).then(res => res.data),
  bulkCreate: (entries) => api.post('/syllabus-completion/admin/bulk', { entries }).then(res => res.data),
  getStats: (params) => api.get('/syllabus-completion/admin/stats', { params }).then(res => res.data),
  generateForm: (formType, filters) => api.post('/syllabus-completion/admin/generate-form', { formType, filters }).then(res => res.data),
  
  // Teacher APIs
  getTeacherEntries: (teacherId, params) => api.get(`/syllabus-completion/teacher/${teacherId}`, { params }).then(res => res.data),
  updateProgress: (id, data) => api.put(`/syllabus-completion/teacher/${id}/progress`, data).then(res => res.data),
  updateTeacherRemarks: (id, data) => api.put(`/syllabus-completion/teacher/${id}/remarks`, data).then(res => res.data),
  
  // Student APIs
  getStudentEntries: (params) => api.get('/syllabus-completion/student', { params }).then(res => res.data),
  
  // Parent APIs
  getParentEntries: (childId, params) => api.get(`/syllabus-completion/parent/${childId}`, { params }).then(res => res.data),
};

export const accountantAPI = {
  getSummary: () => api.get('/accountant/summary').then(res=>res.data),
  getExpenses: (params={}) => api.get('/accountant/expenses', { params }).then(res=>res.data),
  createExpense: (data) => api.post('/accountant/expenses', data),
  getIncomes: (params={}) => api.get('/accountant/incomes', { params }).then(res=>res.data),
  generateSampleData: () => api.post('/accountant/sample-data'),
  
  // Enhanced Salary Template Management
  getSalaryTemplates: () => api.get('/accountant/salary-templates').then(res=>res.data),
  getSalaryTemplateById: (id) => api.get(`/accountant/salary-templates/${id}`).then(res=>res.data),
  createSalaryTemplate: (data) => api.post('/accountant/salary-templates', data).then(res=>res.data),
  updateSalaryTemplate: (id, data) => api.put(`/accountant/salary-templates/${id}`, data).then(res=>res.data),
  deleteSalaryTemplate: (id) => api.delete(`/accountant/salary-templates/${id}`).then(res=>res.data),
  getSalaryTemplateStats: () => api.get('/accountant/salary-template-stats').then(res=>res.data),
  getAvailableRoles: () => api.get('/accountant/available-roles').then(res=>res.data),
  
  // Staff Salary Management
  getStaffList: (params={}) => api.get('/accountant/staff-list', { params }).then(res=>res.data),
  getStaffSalaryHistory: (staffId, params={}) => api.get(`/accountant/staff-salary-history/${staffId}`, { params }).then(res=>res.data),
  createSalaryRecord: (data) => api.post('/accountant/create-salary-record', data).then(res=>res.data),
  updateSalaryRecord: (id, data) => api.put(`/accountant/update-salary-record/${id}`, data).then(res=>res.data),
  bulkSalaryCreation: (data) => api.post('/accountant/bulk-salary-creation', data).then(res=>res.data),
  getPendingSalaryApprovals: () => api.get('/accountant/pending-salary-approvals').then(res=>res.data),
  
  // Staff Management by Role
  getStaffByRole: (role) => api.get(`/accountant/staff-by-role/${role}`).then(res=>res.data),
  getRoleStatistics: () => api.get('/accountant/role-statistics').then(res=>res.data),
  
  // Template Application
  applyTemplateToStaff: (data) => api.post('/accountant/apply-template-to-staff', data).then(res=>res.data),
  getTemplatePreview: (templateId, staffIds) => api.get(`/accountant/template-preview/${templateId}`, { 
    params: { staffIds } 
  }).then(res=>res.data),
  getAllFeePayments: () => api.get('/accountant/fee-payments').then(res => res.data),
  
  // Students Fee Management
  getAllStudentsFeeStatus: (params={}) => api.get('/accountant/students-fee-status', { params }).then(res => res.data),
  getStudentFeeRecords: (studentId, params={}) => api.get(`/accountant/student-fee-records/${studentId}`, { params }).then(res => res.data),

  // Permissions Management
  getAllStaffPermissions: () => api.get('/admin/permissions/staff').then(res => res.data.data || []),
  getStaffPermissions: (staffId) => api.get(`/admin/permissions/${staffId}`).then(res => res.data.data),
  assignRoleAndPermissions: (staffId, data) => api.post(`/admin/permissions/${staffId}/assign`, data).then(res => res.data),
  updateStaffPermissions: (staffId, data) => api.put(`/admin/permissions/${staffId}`, data).then(res => res.data),
  removeStaffPermissions: (staffId) => api.delete(`/admin/permissions/${staffId}`).then(res => res.data),
  getAvailablePermissionRoles: () => api.get('/admin/permissions/roles').then(res => res.data.data || []),
  getPermissionSummary: () => api.get('/admin/permissions/summary').then(res => res.data.data || []),
  bulkAssignPermissions: (data) => api.post('/admin/permissions/bulk-assign', data).then(res => res.data),

  // Transport Form Management
  getTransportForms: (params) => api.get('/transport-forms/admin', { params }).then(res => res.data),
  getTransportFormById: (formId) => api.get(`/transport-forms/admin/${formId}`).then(res => res.data),
  createTransportForm: (formData) => api.post('/transport-forms', formData).then(res => res.data),
  updateTransportForm: (formId, formData) => api.put(`/transport-forms/admin/${formId}`, formData).then(res => res.data),
  deleteTransportForm: (formId) => api.delete(`/transport-forms/admin/${formId}`).then(res => res.data),
  getTransportFormStats: (params) => api.get('/transport-forms/admin/stats', { params }).then(res => res.data),
  downloadTransportFormPDF: (formId) => api.get(`/transport-forms/admin/${formId}/download`, { 
    responseType: 'blob' 
  }).then(res => res.data),
  generateTransportFormPDF: (formId) => api.post(`/transport-forms/admin/${formId}/generate-pdf`).then(res => res.data),
};

export const teacherRemarksAPI = {
  // Admin APIs
  createForm: (data) => api.post('/teacher-remarks/admin', data).then(res => res.data),
  getAllForms: (params) => api.get('/teacher-remarks/admin', { params }).then(res => res.data),
  updateForm: (id, data) => api.put(`/teacher-remarks/admin/${id}`, data).then(res => res.data),
  deleteForm: (id) => api.delete(`/teacher-remarks/admin/${id}`).then(res => res.data),
  bulkCreate: (forms) => api.post('/teacher-remarks/admin/bulk', { forms }).then(res => res.data),
  getStats: (params) => api.get('/teacher-remarks/admin/stats', { params }).then(res => res.data),
  generateReport: (reportType, filters) => api.post('/teacher-remarks/admin/generate-report', { reportType, filters }).then(res => res.data),
  
  // Teacher APIs
  getTeacherForms: (teacherId, params) => api.get(`/teacher-remarks/teacher/${teacherId}`, { params }).then(res => res.data),
  updateProgress: (id, data) => api.put(`/teacher-remarks/teacher/${id}/progress`, data).then(res => res.data),
  updateDetailedRemarks: (id, data) => api.put(`/teacher-remarks/teacher/${id}/remarks`, data).then(res => res.data),
  
  // Student APIs
  getStudentForms: (params) => api.get('/teacher-remarks/student', { params }).then(res => res.data),
  
  // Parent APIs
  getParentForms: (childId, params) => api.get(`/teacher-remarks/parent/${childId}`, { params }).then(res => res.data),
  
  // Audit Log Management
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }).then(res => res.data),
  getAuditLogById: (id) => api.get(`/admin/audit-logs/${id}`).then(res => res.data),
  createAuditLog: (data) => api.post('/admin/audit-logs', data).then(res => res.data),
  updateAuditLog: (id, data) => api.put(`/admin/audit-logs/${id}`, data).then(res => res.data),
  deleteAuditLog: (id) => api.delete(`/admin/audit-logs/${id}`).then(res => res.data),
  getAuditStatistics: () => api.get('/admin/audit-logs/statistics').then(res => res.data),

  // Inspection Log Management
  getInspectionLogs: (params) => api.get('/admin/inspection-logs', { params }).then(res => res.data),
  getInspectionLogById: (id) => api.get(`/admin/inspection-logs/${id}`).then(res => res.data),
  createInspectionLog: (data) => api.post('/admin/inspection-logs', data).then(res => res.data),
  updateInspectionLog: (id, data) => api.put(`/admin/inspection-logs/${id}`, data).then(res => res.data),
  deleteInspectionLog: (id) => api.delete(`/admin/inspection-logs/${id}`).then(res => res.data),
  getInspectionStatistics: () => api.get('/admin/inspection-logs/statistics').then(res => res.data),

  // Budget Approval Management
  getBudgetApprovals: (params) => api.get('/budget-approvals', { params }).then(res => res.data),
  getBudgetApprovalById: (id) => api.get(`/budget-approvals/${id}`).then(res => res.data),
  createBudgetApproval: (data) => api.post('/budget-approvals', data).then(res => res.data),
  updateBudgetApproval: (id, data) => api.put(`/budget-approvals/${id}`, data).then(res => res.data),
  deleteBudgetApproval: (id) => api.delete(`/budget-approvals/${id}`).then(res => res.data),
  submitBudgetApproval: (id) => api.patch(`/budget-approvals/${id}/submit`).then(res => res.data),
  approveBudgetApproval: (id, data) => api.patch(`/budget-approvals/${id}/approve`, data).then(res => res.data),
  rejectBudgetApproval: (id, data) => api.patch(`/budget-approvals/${id}/reject`, data).then(res => res.data),
  getBudgetApprovalStats: () => api.get('/budget-approvals/stats').then(res => res.data),
  downloadBudgetApprovalPDF: (id) => api.get(`/budget-approvals/${id}/download-pdf`, { responseType: 'blob' }).then(res => res.data),
};

// Expense Log Management
export const expenseLogAPI = {
  getExpenseLogs: (params) => api.get('/expense-logs', { params }).then(res => res.data),
  getExpenseLogById: (id) => api.get(`/expense-logs/${id}`).then(res => res.data),
  createExpenseLog: (data) => api.post('/expense-logs', data).then(res => res.data),
  updateExpenseLog: (id, data) => api.put(`/expense-logs/${id}`, data).then(res => res.data),
  deleteExpenseLog: (id) => api.delete(`/expense-logs/${id}`).then(res => res.data),
  updateExpenseLogStatus: (id, data) => api.patch(`/expense-logs/${id}/status`, data).then(res => res.data),
  getExpenseLogStats: () => api.get('/expense-logs/stats').then(res => res.data),
};

// Income Log Management
export const incomeLogAPI = {
  getIncomeLogs: (params) => api.get('/income-logs', { params }).then(res => res.data),
  getIncomeLogById: (id) => api.get(`/income-logs/${id}`).then(res => res.data),
  createIncomeLog: (data) => api.post('/income-logs', data).then(res => res.data),
  updateIncomeLog: (id, data) => api.put(`/income-logs/${id}`, data).then(res => res.data),
  deleteIncomeLog: (id) => api.delete(`/income-logs/${id}`).then(res => res.data),
  updateIncomeLogStatus: (id, data) => api.patch(`/income-logs/${id}/status`, data).then(res => res.data),
  getIncomeLogStats: () => api.get('/income-logs/stats').then(res => res.data),
};

export const getStudentFeeStatus = () => fetch('/api/accountant/fee-status').then(res => res.json());
export const getFeeStats = () => fetch('/api/accountant/fee-stats').then(res => res.json());
export const getTransactionLog = () => fetch('/api/accountant/transaction-log').then(res => res.json());

export const vpAPI = {
  // Dashboard
  getOverview: () => api.get('/vp/department/overview').then(res => res.data),
  getStaff: () => api.get('/vp/department/staff').then(res => res.data),
  getStatistics: () => api.get('/vp/department/statistics').then(res => res.data),
  getDepartment: () => api.get('/vp/department').then(res => res.data),
  updateDepartment: (data) => api.put(`/vp/department/${data.id}`, data).then(res => res.data),
  createDepartment: (data) => api.post('/vp/department', data).then(res => res.data),
  
  // HOD Management
  getAllDepartments: () => api.get('/vp/departments').then(res => res.data),
  assignHOD: (data) => api.post('/vp/department/hod', data).then(res => res.data),
  getHODs: () => api.get('/vp/hods').then(res => res.data),
  
  // Teacher Management
  getTeachers: () => api.get('/vp/teachers').then(res => res.data),
  getTeachersByDepartment: (departmentId) => api.get(`/vp/department/${departmentId}/teachers`).then(res => res.data),
  
  // Exam Management
  getExams: () => api.get('/vp/exams').then(res => res.data),
  createExam: (data) => api.post('/vp/exams', data).then(res => res.data),
  updateExam: (data) => api.put(`/vp/exams/${data.id}`, data).then(res => res.data),
  deleteExam: (examId) => api.delete(`/vp/exams/${examId}`).then(res => res.data),
  
  // Exam Timetable Management
  getTimetables: () => api.get('/vp/timetables').then(res => res.data),
  createTimetable: (data) => api.post('/vp/timetables', data).then(res => res.data),
  updateTimetable: (data) => api.put(`/vp/timetables/${data.id}`, data).then(res => res.data),
  deleteTimetable: (timetableId) => api.delete(`/vp/timetables/${timetableId}`).then(res => res.data),
  getTimetablesByDateRange: (startDate, endDate) => api.get(`/vp/timetables/date-range?startDate=${startDate}&endDate=${endDate}`).then(res => res.data),
  
  // Curriculum Management
  getCurriculumPlans: () => api.get('/vp/curriculum').then(res => res.data),
  getApprovedCurriculumPlans: () => api.get('/vp/curriculum/approved').then(res => res.data),
  createCurriculum: (data) => api.post('/vp/curriculum', data).then(res => res.data),
  updateCurriculum: (data) => api.put(`/vp/curriculum/${data.id}`, data).then(res => res.data),
  deleteCurriculum: (curriculumId) => api.delete(`/vp/curriculum/${curriculumId}`).then(res => res.data),
  approveCurriculum: (curriculumId) => api.post(`/vp/curriculum/${curriculumId}/approve`).then(res => res.data),
  rejectCurriculum: (curriculumId, reason) => api.post(`/vp/curriculum/${curriculumId}/reject`, { reason }).then(res => res.data),
  getCurriculumByGrade: (grade) => api.get(`/vp/curriculum/grade/${grade}`).then(res => res.data),
  // Add new endpoint for teacher remarks
  getTeacherRemarksForCurriculum: (curriculumId) => api.get(`/vp/curriculum/${curriculumId}/teacher-remarks`).then(res => res.data),
  
  // HOD Approval Management
  getHODSubmissions: () => api.get('/vp/hod-submissions').then(res => res.data),
  approveHODSubmission: (submissionId) => api.post(`/vp/hod-submissions/${submissionId}/approve`).then(res => res.data),
  rejectHODSubmission: (submissionId) => api.post(`/vp/hod-submissions/${submissionId}/reject`).then(res => res.data),
  
  // Service Request Management
  getServiceRequests: () => api.get('/vp/service-requests').then(res => res.data),
  approveServiceRequest: (requestId, comments) => api.post(`/vp/service-requests/${requestId}/approve`, { comments }).then(res => res.data),
  rejectServiceRequest: (requestId, comments) => api.post(`/vp/service-requests/${requestId}/reject`, { comments }).then(res => res.data),
  
  // Profile Management
  getProfile: () => api.get('/vp/profile').then(res => res.data),
  updateProfile: (data) => api.put('/vp/profile', data).then(res => res.data),
  changePassword: (data) => api.post('/vp/change-password', data).then(res => res.data),

  // Activities Control Management
  getAllStaffActivities: () => api.get('/vp/activities-control/staff').then(res => res.data),
  getStaffActivities: (staffId) => api.get(`/vp/activities-control/staff/${staffId}`).then(res => res.data),
  saveStaffActivities: (staffId, data) => api.post(`/vp/activities-control/staff/${staffId}`, data).then(res => res.data),
  deleteStaffActivities: (staffId) => api.delete(`/vp/activities-control/staff/${staffId}`).then(res => res.data),
  getAvailableActivities: () => api.get('/vp/activities-control/activities').then(res => res.data),
  bulkAssignActivities: (data) => api.post('/vp/activities-control/bulk-assign', data).then(res => res.data),
  getActivitiesSummary: () => api.get('/vp/activities-control/summary').then(res => res.data),
};

// Staff Activities Control API
export const staffActivitiesControlAPI = {
  getMyActivities: () => api.get('/staffs/activities-control/me').then(res => res.data),
};

// Delegation Authority API
export const delegationAuthorityAPI = {
  // Get all delegation notices
  getAllNotices: () => api.get('/delegation-authority/notices').then(res => res.data),
  
  // Get notice by ID
  getNoticeById: (id) => api.get(`/delegation-authority/notices/${id}`).then(res => res.data),
  
  // Create new notice
  createNotice: (data) => api.post('/delegation-authority/notices', data).then(res => res.data),
  
  // Update notice
  updateNotice: (id, data) => api.put(`/delegation-authority/notices/${id}`, data).then(res => res.data),
  
  // Delete notice
  deleteNotice: (id) => api.delete(`/delegation-authority/notices/${id}`).then(res => res.data),
  
  // Approve notice
  approveNotice: (id, data) => api.put(`/delegation-authority/notices/${id}/approve`, data).then(res => res.data),
  
  // Reject notice
  rejectNotice: (id, data) => api.put(`/delegation-authority/notices/${id}/reject`, data).then(res => res.data),
  
  // Get pending notices for approval
  getPendingNotices: () => api.get('/delegation-authority/notices/pending').then(res => res.data),
  
  // Generate PDF
  generatePDF: (id) => api.get(`/delegation-authority/notices/${id}/pdf`).then(res => res.data),
  
  // Get staff members for delegation
  getStaffMembers: () => api.get('/delegation-authority/staff').then(res => res.data),
  
  // Get departments
  getDepartments: () => api.get('/delegation-authority/departments').then(res => res.data),
};

export default api;