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
  getDashboard: () => api.get('/api/admin-staff/dashboard'),
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
  getProfile: () => api.get('/api/admin-staff/profile'),
  updateProfile: (data) => api.put('/api/admin-staff/profile', data),
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

  // Student Management
  getAllStudents: (params) => api.get('/api/admin-staff/students', { params }).then(res => res.data),
  getStudentById: (studentId) => api.get(`/api/admin-staff/students/${studentId}`),
  registerStudent: (data) => api.post('/api/admin-staff/students', data),
  updateStudent: (studentId, data) => api.put(`/api/admin-staff/students/${studentId}`, data),
  deleteStudent: (studentId) => api.delete(`/api/admin-staff/students/${studentId}`),
  generateStudentReport: (params = {}) => api.get('/api/admin-staff/reports/enrollment', { params: { ...params, format: 'pdf' }, responseType: 'blob' }),

  // Fee Management
  getFeeStructures: () => api.get('/api/admin-staff/fee-structure').then(res => res.data),
  configureFeeStructure: (data) => api.post('/api/admin-staff/fee-structure', data),
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

  // Class Management
  getClasses: () => api.get('/api/admin-staff/classes').then(res=>{
    const mapClass = (c)=>({
      ...c,
      id: c._id || c.id,
      teacherId: c.classTeacher || c.teacherId,
    });
    return Array.isArray(res.data) ? res.data.map(mapClass) : [];
  }),
  createClass: (data) => api.post('/api/admin-staff/classes', data),
  updateClass: (id,data) => api.put(`/api/admin-staff/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/api/admin-staff/classes/${id}`),

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

// Teacher endpoints
export const teacherAPI = {
  // Dashboard
  getDashboard: () => api.get('/teacher/dashboard'),
  
  // Class Management
  getClasses: () => api.get('/teacher/classes'),
  createClass: (data) => api.post('/teacher/classes', data),
  updateClass: (classId, data) => api.put(`/teacher/classes/${classId}`, data),
  deleteClass: (classId) => api.delete(`/teacher/classes/${classId}`),
  getClassStudents: (classId) => api.get(`/teacher/classes/${classId}/students`),
  getClassAttendance: (classId) => api.get(`/teacher/classes/${classId}/attendance`),
  markAttendance: (classId, data) => api.post(`/teacher/classes/${classId}/attendance`, data),
  
  // Assignment Management
  getAssignments: () => api.get('/teacher/assignments'),
  createAssignment: (data) => api.post('/teacher/assignments', data),
  updateAssignment: (assignmentId, data) => api.put(`/teacher/assignments/${assignmentId}`, data),
  deleteAssignment: (assignmentId) => api.delete(`/teacher/assignments/${assignmentId}`),
  getAssignmentSubmissions: (assignmentId) => api.get(`/teacher/assignments/${assignmentId}/submissions`),
  gradeAssignment: (assignmentId, submissionId, data) => 
    api.post(`/teacher/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
  
  // Exam Management
  getExams: () => api.get('/teacher/exams'),
  createExam: (data) => api.post('/teacher/exams', data),
  updateExam: (examId, data) => api.put(`/teacher/exams/${examId}`, data),
  deleteExam: (examId) => api.delete(`/teacher/exams/${examId}`),
  getExamResults: (examId) => api.get(`/teacher/exams/${examId}/results`),
  gradeExam: (examId, studentId, data) => 
    api.post(`/teacher/exams/${examId}/students/${studentId}/grade`, data),
  
  // Student Management
  getStudents: () => api.get('/teacher/students'),
  getStudentDetails: (studentId) => api.get(`/teacher/students/${studentId}`),
  getStudentGrades: (studentId) => api.get(`/teacher/students/${studentId}/grades`),
  getStudentAttendance: (studentId) => api.get(`/teacher/students/${studentId}/attendance`),
  getStudentAssignments: (studentId) => api.get(`/teacher/students/${studentId}/assignments`),
  
  // Grade Management
  getGrades: () => api.get('/teacher/grades'),
  createGrade: (data) => api.post('/teacher/grades', data),
  updateGrade: (gradeId, data) => api.put(`/teacher/grades/${gradeId}`, data),
  deleteGrade: (gradeId) => api.delete(`/teacher/grades/${gradeId}`),
  
  // Attendance Management
  getAttendance: () => api.get('/teacher/attendance'),
  createAttendance: (data) => api.post('/teacher/attendance', data),
  updateAttendance: (attendanceId, data) => api.put(`/teacher/attendance/${attendanceId}`, data),
  deleteAttendance: (attendanceId) => api.delete(`/teacher/attendance/${attendanceId}`),
  
  // Communication Management
  getAnnouncements: () => api.get('/teacher/announcements'),
  createAnnouncement: (data) => api.post('/teacher/announcements', data),
  updateAnnouncement: (announcementId, data) => api.put(`/teacher/announcements/${announcementId}`, data),
  deleteAnnouncement: (announcementId) => api.delete(`/teacher/announcements/${announcementId}`),
  updateMessage: (messageId, data) => api.put(`/teacher/messages/${messageId}`, data),
  deleteMessage: (messageId) => api.delete(`/teacher/messages/${messageId}`),
  
  // Profile Management
  getProfile: () => api.get('/teacher/profile'),
  updateProfile: (data) => api.put('/teacher/profile', data),
  updatePassword: (data) => api.put('/teacher/profile/password', data),
  uploadProfileImage: (formData) => api.post('/teacher/profile/image', formData),
  
  // Notifications and Messages
  getNotifications: () => api.get('/teacher/notifications'),
  getMessages: () => api.get('/teacher/messages'),
  sendMessage: (data) => api.post('/teacher/messages', data),
  
  // Reports
  generateClassReport: (classId, params) => 
    api.get(`/teacher/classes/${classId}/reports`, { params }),
  generateStudentReport: (studentId, params) => 
    api.get(`/teacher/students/${studentId}/reports`, { params }),
  generateAttendanceReport: (params) => 
    api.get('/teacher/reports/attendance', { params }),
  generateGradeReport: (params) => 
    api.get('/teacher/reports/grades', { params }),
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
  getDashboard: () => api.get('/principal/dashboard'),
  
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
  
  // Staff Management
  getStaff: () => api.get('/principal/staff'),
  getStaffDetails: (staffId) => api.get(`/principal/staff/${staffId}`),
  createStaff: (data) => api.post('/principal/staff', data),
  updateStaff: (staffId, data) => api.put(`/principal/staff/${staffId}`, data),
  deleteStaff: (staffId) => api.delete(`/principal/staff/${staffId}`),
  
  // Academic Management
  getAcademicYear: () => api.get('/principal/academic-year'),
  updateAcademicYear: (data) => api.put('/principal/academic-year', data),
  getHolidays: () => api.get('/principal/holidays'),
  createHoliday: (data) => api.post('/principal/holidays', data),
  updateHoliday: (holidayId, data) => 
    api.put(`/principal/holidays/${holidayId}`, data),
  deleteHoliday: (holidayId) => 
    api.delete(`/principal/holidays/${holidayId}`),
  
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
};

export default api;