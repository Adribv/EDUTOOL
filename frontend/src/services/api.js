import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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
  staffLogin: (credentials) => api.post('/api/staffs/login', credentials),
  // Student login
  studentLogin: (credentials) => api.post('/api/students/login', credentials),
  // Parent login
  parentLogin: (credentials) => api.post('/api/parents/login', credentials),
  parentRegister: (data) => api.post('/api/parents/register', data),
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
  studentLogin: (credentials) => api.post('/api/students/login', credentials),
  register: (data) => api.post('/api/students/register', data),
  
  // Profile
  getProfile: () => api.get('/api/students/profile'),
  updateProfile: (data) => api.put('/api/students/profile', data),
  changePassword: (data) => api.put('/api/students/change-password', data),
  
  // Academic Dashboard
  getTimetable: () => api.get('/api/students/timetable'),
  getSubjects: () => api.get('/api/students/subjects'),
  getAssignments: () => api.get('/api/students/assignments'),
  getAssignmentDetails: (assignmentId) => api.get(`/api/students/assignments/${assignmentId}`),
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
    
    return api.post(`/api/students/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getSubmissionFeedback: (submissionId) => api.get(`/api/students/submissions/${submissionId}`),
  
  // Attendance
  getAttendance: (params) => api.get('/api/students/attendance', { params }),
  submitLeaveRequest: (data) => api.post('/api/students/leave-requests', data),
  getLeaveRequests: () => api.get('/api/students/leave-requests'),
  
  // Examinations
  getExams: () => api.get('/api/students/exams/upcoming'),
  getAdmitCard: (examId) => api.get(`/api/students/exams/${examId}/admit-card`),
  getExamResults: () => api.get('/api/students/exam-results'),
  getReportCards: () => api.get('/api/students/report-cards'),
  getPerformanceAnalytics: () => api.get('/api/students/performance-analytics'),
  
  // Fee Management
  getFeeStructure: (params) => api.get('/api/students/fee-structure', { params }),
  getFees: (params) => api.get('/api/students/payment-status', { params }),
  getPaymentReceipt: (paymentId) => api.get(`/api/students/payment-receipts/${paymentId}`),
  makePayment: (paymentData) => api.post('/api/students/payments', paymentData),
  submitPayment: (paymentData) => api.post('/api/students/payments', paymentData),
  
  // Learning Resources
  getResources: (params) => api.get('/api/students/learning-resources', { params }),
  getResourceDetails: (resourceId) => api.get(`/api/students/learning-resources/${resourceId}`),
  
  // Communication
  getAnnouncements: () => api.get('/api/students/announcements'),
  getMessages: () => api.get('/api/students/messages'),
  getMessageDetails: (messageId) => api.get(`/api/students/messages/${messageId}`),
  sendMessageReply: (messageId, data) => api.post(`/api/students/messages/${messageId}/reply`, data),
  getClassDiscussions: () => api.get('/api/students/class-discussions'),
  getDiscussionDetails: (discussionId) => api.get(`/api/students/class-discussions/${discussionId}`),
  postDiscussionComment: (discussionId, data) => api.post(`/api/students/class-discussions/${discussionId}/comments`, data),
  
  // Homework
  getHomework: () => api.get('/api/students/homework'),
  getHomeworkDetails: (homeworkId) => api.get(`/api/students/homework/${homeworkId}`),
  submitHomework: (homeworkId, data) => api.post(`/api/students/homework/${homeworkId}/submit`, data),
  getHomeworkSubmissions: () => api.get('/api/students/homework-submissions'),
  
  // Documents
  getDocuments: () => api.get('/api/students/documents'),
  
  // Legacy endpoints for backward compatibility
  getDashboard: () => api.get('/api/students/profile'),
};

// Staff endpoints
export const staffAPI = {
  getDashboard: () => api.get('/api/staffs/dashboard'),
  getCoordinatedStudents: () => api.get('/api/staffs/coordinated-students'),
  getCoordinatedParents: () => api.get('/api/staffs/coordinated-parents'),
  getCoordinatedClasses: () => api.get('/api/staffs/coordinated-classes'),
  getProfile: () => api.get('/api/staffs/profile'),
  updateProfile: (data) => api.put('/api/staffs/profile', data),
  getLeaveRequests: () => api.get('/api/staffs/leave-requests'),
  updateLeaveRequest: (id, data) => api.put(`/api/staffs/leave-requests/${id}`, data),
  getClasses: () => api.get('/api/admin-staff/classes').then(res=>{
    const mapClass = (c)=>({
      ...c,
      id: c._id || c.id,
      teacherId: c.classTeacher || c.teacherId,
    });
    return Array.isArray(res.data) ? res.data.map(mapClass) : [];
  }),
  getAssignments: () => api.get('/api/admin-staff/assignments'),
  getExams: () => api.get('/api/admin-staff/exams'),
  getStudents: () => api.get('/api/admin-staff/students'),
  createAssignment: (data) => api.post('/api/admin-staff/assignments', data),
  createExam: (data) => api.post('/api/admin-staff/exams', data),
  gradeAssignment: (assignmentId, data) => 
    api.post(`/api/admin-staff/assignments/${assignmentId}/grade`, data),
  markAttendance: (classId, data) => 
    api.post(`/api/admin-staff/classes/${classId}/attendance`, data),
  uploadProfileImage: (formData) => api.post('/api/admin-staff/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAttendance: () => api.get('/api/admin-staff/attendance'),
  getEvents: () => api.get('/api/admin-staff/events'),
  getNotifications: () => api.get('/api/admin-staff/notifications'),
};

// Parent endpoints
export const parentAPI = {
  getDashboard: () => api.get('/api/parents/dashboard').then(res=>res.data),
  getChildren: () => api.get('/api/parents/children').then(res => res.data),
  getChildProfile: (childId) => api.get(`/api/parents/children/${childId}`).then(res => res.data),
  getChildProgress: (childId) => api.get(`/api/parents/children/${childId}/performance`).then(res => res.data),
  getFees: (childId, params) => api.get(`/api/parents/children/${childId}/fee-structure`, { params }),
  getMessages: () => api.get('/api/parents/messages/received').then(res=>res.data),
  getSentMessages: () => api.get('/api/parents/messages/sent').then(res=>res.data),
  payFees: (data) => api.post('/api/parents/payments', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/parents/profile', data),
  uploadProfileImage: (formData) => api.post('/api/parents/profile/image', formData),
  getChildGrades: (childId) => api.get(`/api/parents/children/${childId}/exam-results`).then(res => res.data),
  getChildAttendance: (childId, params) => api.get(`/api/parents/children/${childId}/attendance`, { params }).then(res => res.data),
  getChildAssignments: (childId) => api.get(`/api/parents/children/${childId}/assignments`).then(res => res.data),
  getChildExams: (childId) => api.get(`/api/parents/children/${childId}/exams`).then(res => res.data),
  getFeeBalance: (childId) => api.get(`/api/parents/children/${childId}/payment-status`).then(res => res.data),
  getUpcomingPayments: (childId) => api.get(`/api/parents/children/${childId}/payment-status`).then(res => res.data),
  getPaymentHistory: (childId) => api.get(`/api/parents/children/${childId}/payment-status`).then(res => res.data),
  getPaymentMethods: () => api.get('/api/parents/payment-methods'),
  makePayment: (data) => api.post('/api/parents/payments', data),
  downloadReceipt: (childId, paymentId) => api.get(`/api/parents/children/${childId}/payment-receipts/${paymentId}`, { responseType: 'blob' }),
  getChildTransport: (childId) => api.get(`/api/parents/children/${childId}/transport`),
  getChildHealth: (childId) => api.get(`/api/parents/children/${childId}/health`),
  getChildSubjects: (childId) => api.get(`/api/parents/children/${childId}/subjects`),
  getChildTimetable: (childId) => api.get(`/api/parents/children/${childId}/timetable`),
  getChildReportCards: (childId) => api.get(`/api/parents/children/${childId}/report-cards`),
  getChildLeaveApplications: (childId) => api.get(`/api/parents/children/${childId}/leave-applications`),
  submitLeaveRequest: (childId, data) => api.post(`/api/parents/children/${childId}/leave-application`, data),
  sendMessage: (data) => api.post('/api/parents/messages', data),
  submitComplaint: (data) => api.post('/api/parents/complaints', data),
  scheduleMeeting: (data) => api.post('/api/parents/meetings', data),
  getAnnouncements: () => api.get('/api/parents/announcements'),
  getSchoolCalendar: (params) => api.get('/api/parents/calendar', { params }),
  linkStudent: (rollNumber) => api.post('/api/parents/link-student', { rollNumber }),
};

// Admin endpoints
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/api/admin-staff/dashboard'),

  // Profile Management
  getProfile: () => api.get('/api/admin-staff/profile').then(res => res.data),
  updateProfile: (data) => api.put('/api/admin-staff/profile', data),
  updatePassword: (data) => api.put('/api/admin-staff/profile/password', data),
  uploadProfileImage: (formData) => api.post('/api/admin-staff/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Staff Management
  getAllStaff: (params) => api.get('/api/admin-staff/staff', { params }),
  getStaffById: (staffId) => api.get(`/api/admin-staff/staff/${staffId}`),
  registerStaff: (data) => api.post('/api/admin-staff/staff', data),
  updateStaff: (staffId, data) => api.put(`/api/admin-staff/staff/${staffId}`, data),
  deleteStaff: (staffId) => api.delete(`/api/admin-staff/staff/${staffId}`),
  getStaffAttendance: () => api.get('/api/admin-staff/staff/attendance'),
  generateStaffReport: (params) => api.get('/api/admin-staff/reports/staff', { params }),
  getDepartments: () => api.get('/api/admin-staff/departments').then(res => res.data),

  // Student Management
  getAllStudents: (params) => api.get('/api/admin-staff/students', { params }).then(res => res.data),
  getStudentById: (studentId) => api.get(`/api/admin-staff/students/${studentId}`),
  registerStudent: (data) => api.post('/api/admin-staff/students', data),
  updateStudent: (studentId, data) => api.put(`/api/admin-staff/students/${studentId}`, data),
  deleteStudent: (studentId) => api.delete(`/api/admin-staff/students/${studentId}`),
  generateStudentReport: (params = {}) => api.get('/api/admin-staff/reports/enrollment', { params: { ...params, format: 'pdf' }, responseType: 'blob' }),

  // Fee Management
  getFeeStructures: () => api.get('/api/admin-staff/fee-structure').then(res => res.data),
  configureFeeStructure: (data) => api.post('/api/admin-staff/fee-structure/approval', data),
  updateFeeStructure: (id, data) => api.post('/api/admin-staff/fee-structure', { ...data, id }),
  deleteFeeStructure: (id) => api.delete(`/api/admin-staff/fee-structure/${id}`),
  generateFeeReport: (params = {}) => api.get('/api/admin-staff/reports/fee-collection', {
    params: { ...params, format: 'pdf' },
    responseType: 'blob'
  }),

  // System Settings
  updateSchoolInfo: (data) => api.put('/api/admin-staff/configuration/school-info', data),
  getSchoolInfo: () => api.get('/api/admin-staff/configuration/school-info'),
  configureTimetable: (data) => api.post('/api/admin-staff/configuration/timetable', data),
  getTimetable: (params) => api.get('/api/admin-staff/configuration/timetable', { params }),

  // User Management
  createUser: (payload) => {
    const role = (payload.role || '').toLowerCase();
    let endpoint = '/api/admin-staff/staff';

    // Prepare data according to role
    let dataToSend = { ...payload };

    if (role === 'student') {
      endpoint = '/api/admin-staff/students';
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
      endpoint = '/api/admin-staff/parents';
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
    } else {
      // staff / teacher
      if (role === 'teacher') {
        dataToSend.role = 'Teacher';
      } else {
        dataToSend.role = 'AdminStaff';
      }
    }

    return api.post(endpoint, dataToSend);
  },
  getAllUsers: (params) => api.get('/api/admin-staff/staff', { params }).then(res=>res.data),
  updateUser: (userId, payload) => {
    const role = (payload.role || '').toLowerCase();
    let endpoint = `/api/admin-staff/staff/${userId}`;

    let dataToSend = { ...payload };

    if (role === 'student') {
      endpoint = `/api/admin-staff/students/${userId}`;
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
      endpoint = `/api/admin-staff/parents/${userId}`;
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
    } else {
      if (role === 'teacher') {
        dataToSend.role = 'Teacher';
      } else {
        dataToSend.role = 'AdminStaff';
      }
    }

    return api.put(endpoint, dataToSend);
  },
  deleteUser: (userId, role='staff') => {
    const r = role.toLowerCase();
    let endpoint = `/api/admin-staff/staff/${userId}`;
    if (r === 'student') endpoint = `/api/admin-staff/students/${userId}`;
    else if (r === 'parent') endpoint = `/api/admin-staff/parents/${userId}`;
    return api.delete(endpoint);
  },
  resetUserPassword: (userId, role='staff') => {
    const r = role.toLowerCase();
    let endpoint = `/api/admin-staff/staff/${userId}/reset-password`;
    if (r === 'student') endpoint = `/api/admin-staff/students/${userId}/reset-password`;
    else if (r === 'parent') endpoint = `/api/admin-staff/parents/${userId}/reset-password`;
    return api.post(endpoint);
  },

  // Reports
  generateAttendanceReport: (params) => api.get('/api/admin-staff/reports/attendance', { params }),
  generateAcademicReport: (params) => api.get('/api/admin-staff/reports/academic', { params }),
  generateFinancialReport: (params) => api.get('/api/admin-staff/reports/financial', { params }),

  // Inventory Management
  getInventory: () => api.get('/api/admin-staff/inventory').then(res=>res.data),
  createInventoryItem: (data) => api.post('/api/admin-staff/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/api/admin-staff/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/api/admin-staff/inventory/${id}`),

  // Enquiry Management
  getEnquiries: (params) => api.get('/api/admin-staff/enquiries', { params }),
  createEnquiry: (data) => api.post('/api/admin-staff/enquiries', data),
  updateEnquiry: (id, data) => api.put(`/api/admin-staff/enquiries/${id}`, data),
  getEnquiryStats: () => api.get('/api/admin-staff/enquiries/stats'),

  // Supplier Request Management
  getSupplierRequests: (params) => api.get('/api/admin-staff/supplier-requests', { params }),
  getSupplierRequestById: (id) => api.get(`/api/admin-staff/supplier-requests/${id}`),
  createSupplierRequest: (data) => api.post('/api/admin-staff/supplier-requests', data),
  updateSupplierRequest: (id, data) => api.put(`/api/admin-staff/supplier-requests/${id}`, data),
  deleteSupplierRequest: (id) => api.delete(`/api/admin-staff/supplier-requests/${id}`),
  addSupplierRequestNote: (id, data) => api.post(`/api/admin-staff/supplier-requests/${id}/notes`, data),
  getSupplierRequestStats: () => api.get('/api/admin-staff/supplier-requests/stats'),
  submitSupplierRequest: (id) => api.post(`/api/admin-staff/supplier-requests/${id}/submit`),

  // Event Management
  getEvents: () => api.get('/api/admin-staff/calendar').then(res=>{
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

    return api.post('/api/admin-staff/calendar', payload);
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

    return api.post('/api/admin-staff/approvals', payload);
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

    return api.put(`/api/admin-staff/calendar/${id}`, payload);
  },
  deleteEvent: (id) => api.delete(`/api/admin-staff/calendar/${id}`),

  // Communication Management
  getCommunications: () => api.get('/api/admin-staff/communications').then(res=>{
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

    return api.post('/api/admin-staff/communications', payload);
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

    return api.post('/api/admin-staff/approvals', payload);
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

    return api.put(`/api/admin-staff/communications/${id}`, payload);
  },
  updateCommunicationStatus: (id,data) => api.put(`/api/admin-staff/communications/${id}/status`, data),

  // Approval Management
  getApprovalRequests: (params = {}) => api.get('/api/admin-staff/approvals', { params }).then(res => res.data),
  createApprovalRequest: (data) => api.post('/api/admin-staff/approvals', data),
  updateApprovalRequest: (id, data) => api.put(`/api/admin-staff/approvals/${id}`, data),
  deleteApprovalRequest: (id) => api.delete(`/api/admin-staff/approvals/${id}`),

  // Class Management
  getClasses: () => api.get('/api/admin-staff/classes').then(res=>{
    const mapClass = (c)=>({
      ...c,
      id: c._id || c.id,
      coordinator: c.coordinator || c.coordinatorId,
    });
    return Array.isArray(res.data) ? res.data.map(mapClass) : [];
  }),
  createClass: (data) => api.post('/api/admin-staff/classes', data),
  updateClass: (id,data) => api.put(`/api/admin-staff/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/api/admin-staff/classes/${id}`),
  getTeachers: () => api.get('/api/admin-staff/staff/teachers/public').then(res => res.data),

  // Subject Management
  getSubjects: () => api.get('/api/admin-staff/subjects').then(res=>{
    const mapSubject = (s)=>({
      ...s,
      id: s._id || s.id,
      classId: s.class || s.classId,
      teacherId: s.teacher || s.teacherId,
    });
    return Array.isArray(res.data) ? res.data.map(mapSubject) : [];
  }),
  createSubject: (data) => api.post('/api/admin-staff/subjects', data),
  updateSubject: (id,data) => api.put(`/api/admin-staff/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/api/admin-staff/subjects/${id}`),

  // Schedule Management
  getSchedules: () => api.get('/api/admin-staff/schedules').then(res=>res.data),
  createSchedule: (data)=>api.post('/api/admin-staff/schedules', data),
  updateSchedule:(id,data)=>api.put(`/api/admin-staff/schedules/${id}`,data),
  deleteSchedule:(id)=>api.delete(`/api/admin-staff/schedules/${id}`),
};

// Teacher API functions
export const teacherAPI = {
  // Profile Management - Updated to use staff endpoints with staffId
  getProfile: (staffId) => api.get(`/api/staffs/${staffId}/profile`).then(res => res.data),
  updateProfile: (staffId, data) => api.put(`/api/staffs/${staffId}/profile`, data).then(res => res.data),
  changePassword: (data) => api.put('/api/staffs/change-password', data).then(res => res.data),
  uploadProfileImage: (formData) => api.put('/api/staffs/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  
  // Professional Development Management
  addProfessionalDevelopment: (data) => api.post('/api/staffs/professional-development', data).then(res => res.data),
  updateProfessionalDevelopment: (index, data) => api.put(`/api/staffs/professional-development/${index}`, data).then(res => res.data),
  deleteProfessionalDevelopment: (index) => api.delete(`/api/staffs/professional-development/${index}`).then(res => res.data),
  
  // Get public profile of another staff member
  getPublicProfile: (staffId) => api.get(`/api/staffs/profile/${staffId}`).then(res => res.data),

  // Class and Subject Management - Updated with staffId
  getClasses: (staffId) => api.get(`/api/staffs/${staffId}/coordinated-classes`).then(res => res.data),
  getStudents: (staffId) => api.get(`/api/staffs/${staffId}/coordinated-students`).then(res => res.data),
  getAssignedStudents: (staffId) => api.get(`/api/staffs/${staffId}/coordinated-students`).then(res => res.data),
  getCoordinatedStudents: (staffId) => api.get(`/api/staffs/${staffId}/coordinated-students`).then(res => res.data),
  getCoordinatedParents: (staffId) => api.get(`/api/staffs/${staffId}/coordinated-parents`).then(res => res.data),
  getClassDetails: (classId) => api.get(`/api/staffs/classes/${classId}`).then(res => res.data),
  createClass: (data) => api.post('/api/staffs/classes', data).then(res => res.data),
  updateClass: (classId, data) => api.put(`/api/staffs/classes/${classId}`, data).then(res => res.data),
  deleteClass: (classId) => api.delete(`/api/staffs/classes/${classId}`).then(res => res.data),
  saveAttendance: (classId, data) => api.post(`/api/staffs/classes/${classId}/attendance`, data).then(res => res.data),

  // Timetable
  getTimetable: () => api.get('/api/teachers/timetable').then(res => res.data),
  requestSubstitution: (data) => api.post('/api/teachers/substitution-requests', data).then(res => res.data),
  getSubstitutionRequests: () => api.get('/api/teachers/substitution-requests').then(res => res.data),
  getAcademicCalendar: () => api.get('/api/teachers/academic-calendar').then(res => res.data),
  getCalendarEvents: () => api.get('/api/teachers/calendar-events').then(res => res.data),
  createEvent: (data) => api.post('/api/teachers/events', data).then(res => res.data),
  updateEvent: (eventId, data) => api.put(`/api/teachers/events/${eventId}`, data).then(res => res.data),
  deleteEvent: (eventId) => api.delete(`/api/teachers/events/${eventId}`).then(res => res.data),

  // Attendance Management
  markAttendance: (data) => api.post('/api/teachers/attendance', data).then(res => res.data),
  getAttendance: () => api.get('/api/teachers/attendance').then(res => res.data),
  getMarkedAttendance: () => api.get('/api/teachers/attendance').then(res => res.data),
  getClassAttendance: (classId) => api.get(`/api/teachers/attendance/${classId}`).then(res => res.data),
  createAttendance: (data) => api.post('/api/teachers/attendance', data).then(res => res.data),
  updateAttendance: (attendanceId, data) => api.put(`/api/teachers/attendance/${attendanceId}`, data).then(res => res.data),
  
  // Enhanced Attendance Management
  markClassAttendance: (data) => api.post('/api/teachers/attendance', data).then(res => res.data),
  getClassAttendanceByDate: (className, section, date) => api.get(`/api/teachers/attendance/${className}/${section}/${date}`).then(res => res.data),
  generateAttendanceReport: (className, section, startDate, endDate) => api.get(`/api/teachers/attendance-report/${className}/${section}/${startDate}/${endDate}`).then(res => res.data),
  getStudentsByClass: (className, section) => api.get(`/api/teachers/students/${className}/${section}`).then(res => res.data),
  exportAttendanceCSV: (className, section, startDate, endDate) => api.get(`/api/teachers/attendance-report/${className}/${section}/${startDate}/${endDate}?format=csv`, { responseType: 'blob' }),

  // Assignment Management
  createAssignment: (data) => api.post('/api/teachers/assignments', data).then(res => res.data),
  getAssignments: () => api.get('/api/teachers/assignments').then(res => res.data),
  getAssignmentDetails: (assignmentId) => api.get(`/api/teachers/assignments/${assignmentId}`).then(res => res.data),
  updateAssignment: (assignmentId, data) => api.put(`/api/teachers/assignments/${assignmentId}`, data).then(res => res.data),
  deleteAssignment: (assignmentId) => api.delete(`/api/teachers/assignments/${assignmentId}`).then(res => res.data),
  getSubmissions: (assignmentId) => api.get(`/api/teachers/assignments/${assignmentId}/submissions`).then(res => res.data),
  gradeSubmission: (submissionId, data) => api.put(`/api/teachers/submissions/${submissionId}/grade`, data).then(res => res.data),

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
    return api.post('/api/teachers/exams', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getExams: () => api.get('/api/teachers/exams').then(res => res.data),
  getExamResults: (examId) => api.get(`/api/teachers/exams/${examId}/results`).then(res => res.data),
  enterExamResults: (examId, data) => api.post(`/api/teachers/exams/${examId}/results`, data).then(res => res.data),
  generatePerformanceReport: (examId) => api.get(`/api/teachers/exams/${examId}/performance-report`).then(res => res.data),
  updateExam: (examId, data) => api.put(`/api/teachers/exams/${examId}`, data).then(res => res.data),
  deleteExam: (examId) => api.delete(`/api/teachers/exams/${examId}`).then(res => res.data),
  gradeExam: (resultId, data) => api.put(`/api/teachers/exam-results/${resultId}`, data).then(res => res.data),

  // Learning Materials
  submitLessonPlan: (data) => api.post('/api/teachers/lesson-plans', data).then(res => res.data),
  getLessonPlans: () => api.get('/api/teachers/lesson-plans').then(res => res.data),
  uploadResource: (data) => api.post('/api/teachers/resources', data).then(res => res.data),
  getResources: () => api.get('/api/teachers/resources').then(res => res.data),
  getDepartmentalResources: () => api.get('/api/teachers/departmental-resources').then(res => res.data),
  getLearningResources: () => api.get('/api/teachers/resources').then(res => res.data),
  createResource: (data) => api.post('/api/teachers/resources', data).then(res => res.data),
  updateResource: (resourceId, data) => api.put(`/api/teachers/resources/${resourceId}`, data).then(res => res.data),
  deleteResource: (resourceId) => api.delete(`/api/teachers/resources/${resourceId}`).then(res => res.data),

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
    return api.post('/api/teachers/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getReceivedMessages: () => api.get('/api/teachers/messages/received').then(res => res.data),
  getSentMessages: () => api.get('/api/teachers/messages/sent').then(res => res.data),
  getMessages: () => api.get('/api/teachers/messages').then(res => res.data),
  replyToMessage: (messageId, data) => api.post(`/api/teachers/messages/${messageId}/reply`, data).then(res => res.data),
  postAnnouncement: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachments' && Array.isArray(data[key])) {
        data[key].forEach(file => formData.append('attachments', file));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/api/teachers/announcements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getAnnouncements: () => api.get('/api/teachers/announcements').then(res => res.data),
  createAnnouncement: (data) => api.post('/api/teachers/announcements', data).then(res => res.data),
  updateAnnouncement: (announcementId, data) => api.put(`/api/teachers/announcements/${announcementId}`, data).then(res => res.data),
  deleteAnnouncement: (announcementId) => api.delete(`/api/teachers/announcements/${announcementId}`).then(res => res.data),
  scheduleMeeting: (data) => api.post('/api/teachers/meetings', data).then(res => res.data),
  getMeetings: () => api.get('/api/teachers/meetings').then(res => res.data),

  // Student Performance
  recordPerformance: (data) => api.post('/api/teachers/student-performance', data).then(res => res.data),
  getStudentPerformance: (studentId, subject = null) => {
    const url = subject 
      ? `/api/teachers/student-performance/${studentId}/subject/${subject}`
      : `/api/teachers/student-performance/${studentId}`;
    return api.get(url).then(res => res.data);
  },
  addBehavioralObservation: (studentId, data) => api.post(`/api/teachers/student-performance/${studentId}/observations`, data).then(res => res.data),
  createInterventionPlan: (studentId, data) => api.post(`/api/teachers/student-performance/${studentId}/intervention-plan`, data).then(res => res.data),

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
    return api.post('/api/teachers/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getProjects: () => api.get('/api/teachers/projects').then(res => res.data),
  getProjectDetails: (projectId) => api.get(`/api/teachers/projects/${projectId}`).then(res => res.data),
  updateProject: (projectId, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachment' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/api/teachers/projects/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  recordStudentContribution: (projectId, data) => api.post(`/api/teachers/projects/${projectId}/student-contributions`, data).then(res => res.data),
  getStudentContributions: (projectId) => api.get(`/api/teachers/projects/${projectId}/student-contributions`).then(res => res.data),
  recordExtracurricularAchievement: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'certificate' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/api/teachers/extracurricular-achievements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  // Parent Interaction
  getParentMeetings: () => api.get('/api/teachers/parent-meetings').then(res => res.data),
  recordCommunication: (data) => api.post('/api/teachers/parent-communications', data).then(res => res.data),
  getCommunicationHistory: (parentId) => api.get(`/api/teachers/parent-communications/${parentId}`).then(res => res.data),
  documentConcern: (data) => api.post('/api/teachers/parent-concerns', data).then(res => res.data),
  addFollowUp: (concernId, data) => api.put(`/api/teachers/parent-concerns/${concernId}/follow-up`, data).then(res => res.data),
  sendProgressUpdate: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachment' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/api/teachers/progress-updates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  // Feedback System
  submitSuggestion: (data) => api.post('/api/teachers/academic-suggestions', data).then(res => res.data),
  requestResource: (data) => api.post('/api/teachers/resource-requests', data).then(res => res.data),
  getResourceRequests: () => api.get('/api/teachers/resource-requests').then(res => res.data),
  provideCurriculumFeedback: (data) => api.post('/api/teachers/curriculum-feedback', data).then(res => res.data),
  getCurriculumFeedback: () => api.get('/api/teachers/curriculum-feedback').then(res => res.data),

  // Leave Request Management - Updated with staffId
  getLeaveRequests: (staffId) => api.get(`/api/staffs/${staffId}/leave-requests`).then(res => res.data),

  updateLeaveRequest: (staffId, leaveId, data) => api.put(`/api/staffs/${staffId}/leave-requests/${leaveId}`, data).then(res => res.data),
  
  // Student Attendance Management
  getStudentAttendancePercentage: (staffId, studentId) => api.get(`/api/staffs/${staffId}/students/${studentId}/attendance`).then(res => res.data),
  
  // VP Exam Management - For viewing VP-scheduled exams
  getVPExams: (staffId) => api.get(`/api/staffs/${staffId}/published-exams`).then(res => res.data),
  getVPExamsByGrade: (staffId, grade) => api.get(`/api/staffs/${staffId}/published-exams?grade=${grade}`).then(res => res.data),
  getVPExamsBySubject: (staffId, subject) => api.get(`/api/staffs/${staffId}/published-exams?subject=${subject}`).then(res => res.data),
  getVPExamsFiltered: (staffId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.grade && filters.grade !== 'all') params.append('grade', filters.grade);
    if (filters.subject && filters.subject !== 'all') params.append('subject', filters.subject);
    return api.get(`/api/staffs/${staffId}/published-examinations?${params.toString()}`).then(res => res.data);
  },
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
};

// Principal endpoints
export const principalAPI = {
  // Dashboard
  getDashboard: () => api.get('/api/principal/dashboard'),
  
  // Approval System
  getPendingApprovals: () => api.get('/api/principal/approvals'),
  getApprovalDetails: (approvalId) => api.get(`/api/principal/approvals/${approvalId}`),
  approveRequest: (approvalId, data) => api.put(`/api/principal/approvals/${approvalId}/approve`, data),
  rejectRequest: (approvalId, data) => api.put(`/api/principal/approvals/${approvalId}/reject`, data),
  getApprovalHistory: (params) => api.get('/api/principal/approvals/history', { params }),
  getAllApprovals: () => api.get('/api/principal/approvals/all'),
  
  // Student Management
  getAllStudents: () => api.get('/api/principal/students'),
  getStudentDetails: (studentId) => api.get(`/api/principal/students/${studentId}`),
  getStudentAttendance: () => api.get('/api/principal/students/attendance'),
  getStudentPerformance: () => api.get('/api/principal/students/performance'),
  
  // Staff Management
  getStaff: () => api.get('/api/principal/staff'),
  getStaffDetails: (staffId) => api.get(`/api/principal/staff/${staffId}`),
  getLeaveRequests: () => api.get('/api/principal/staff/leave-requests'),
  getStaffPerformance: () => api.get('/api/principal/staff/performance'),
  approveLeaveRequest: (leaveId, data) => api.put(`/api/principal/staff/leave-requests/${leaveId}/approve`, data),
  rejectLeaveRequest: (leaveId, data) => api.put(`/api/principal/staff/leave-requests/${leaveId}/reject`, data),
  
  // Admissions
  getAdmissions: () => api.get('/api/principal/admissions'),
  approveAdmission: (admissionId, data) => api.put(`/api/principal/admissions/${admissionId}/approve`, data),
  rejectAdmission: (admissionId, data) => api.put(`/api/principal/admissions/${admissionId}/reject`, data),
  
  // School Management
  getSchoolInfo: () => api.get('/api/principal/school'),
  updateSchoolInfo: (data) => api.put('/api/principal/school', data),
  
  // Department Management
  getDepartments: () => api.get('/api/principal/departments'),
  createDepartment: (data) => api.post('/api/principal/departments', data),
  updateDepartment: (departmentId, data) => 
    api.put(`/api/principal/departments/${departmentId}`, data),
  deleteDepartment: (departmentId) => 
    api.delete(`/api/principal/departments/${departmentId}`),
  getDepartmentDetails: (departmentId) => 
    api.get(`/api/principal/departments/${departmentId}`),
  
  // Academic Management
  getAcademicYear: () => api.get('/api/principal/academic-year'),
  updateAcademicYear: (data) => api.put('/api/principal/academic-year', data),
  getHolidays: () => api.get('/api/principal/holidays'),
  createHoliday: (data) => api.post('/api/principal/holidays', data),
  updateHoliday: (holidayId, data) => 
    api.put(`/api/principal/holidays/${holidayId}`, data),
  deleteHoliday: (holidayId) => 
    api.delete(`/api/principal/holidays/${holidayId}`),
  getClassCurriculumDetails: (className) => 
    api.get(`/api/principal/curriculum/${className}`),
  getCurriculumOverview: () => api.get('/api/principal/curriculum'),
  debugCurriculumData: () => api.get('/api/principal/curriculum/debug'),
  getAllExaminations: () => api.get('/api/principal/examinations'),
  getAcademicResults: () => api.get('/api/principal/results'),
  getAttendanceOverview: () => api.get('/api/principal/attendance'),
  
  // Reports
  generateSchoolReport: (params) => 
    api.get('/api/principal/reports/school', { params }),
  generateDepartmentReport: (params) => 
    api.get('/api/principal/reports/departments', { params }),
  generateStaffReport: (params) => 
    api.get('/api/principal/reports/staff', { params }),
  
  // Profile Management
  getProfile: () => api.get('/api/principal/profile'),
  updateProfile: (data) => api.put('/api/principal/profile', data),
  updatePassword: (data) => api.put('/api/principal/profile/password', data),
  uploadProfileImage: (formData) => 
    api.post('/api/principal/profile/image', formData),
  
  // Notifications and Messages
  getNotifications: () => api.get('/api/principal/notifications'),
  getMessages: () => api.get('/api/principal/messages'),
  sendMessage: (data) => api.post('/api/principal/messages', data),
};

export default api;