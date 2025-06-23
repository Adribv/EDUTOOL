import api from './api';

const adminService = {
  // Dashboard
  getDashboardData: () => api.get('/api/admin-staff/dashboard'),
  
  // User Management
  getUsers: (role) => {
    if (role === 'student') {
      return api.get('/api/admin-staff/students');
    } else if (role === 'parent') {
      return api.get('/api/admin-staff/parents');
    } else {
      return api.get('/api/admin-staff/staff');
    }
  },
  createUser: (data) => {
    const role = (data.role || '').toLowerCase();
    if (role === 'student') {
      return api.post('/api/admin-staff/students', data);
    } else if (role === 'parent') {
      return api.post('/api/admin-staff/parents', data);
    } else {
      return api.post('/api/admin-staff/staff', data);
    }
  },
  updateUser: (id, data) => {
    const role = (data.role || '').toLowerCase();
    if (role === 'student') {
      return api.put(`/api/admin-staff/students/${id}`, data);
    } else if (role === 'parent') {
      return api.put(`/api/admin-staff/parents/${id}`, data);
    } else {
      return api.put(`/api/admin-staff/staff/${id}`, data);
    }
  },
  deleteUser: (id, role) => {
    if (role === 'student') {
      return api.delete(`/api/admin-staff/students/${id}`);
    } else if (role === 'parent') {
      return api.delete(`/api/admin-staff/parents/${id}`);
    } else {
      return api.delete(`/api/admin-staff/staff/${id}`);
    }
  },
  
  // Class Management
  getClasses: () => api.get('/api/admin-staff/classes'),
  createClass: (data) => api.post('/api/admin-staff/classes', data),
  updateClass: (id, data) => api.put(`/api/admin-staff/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/api/admin-staff/classes/${id}`),
  
  // Subject Management
  getSubjects: () => api.get('/api/admin-staff/subjects'),
  createSubject: (data) => api.post('/api/admin-staff/subjects', data),
  updateSubject: (id, data) => api.put(`/api/admin-staff/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/api/admin-staff/subjects/${id}`),
  
  // Schedule Management
  getSchedules: () => api.get('/api/admin-staff/schedules'),
  createSchedule: (data) => api.post('/api/admin-staff/schedules', data),
  updateSchedule: (id, data) => api.put(`/api/admin-staff/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/api/admin-staff/schedules/${id}`),
  
  // Fee Management
  getFees: () => api.get('/api/admin-staff/fee-structure'),
  createFee: (data) => api.post('/api/admin-staff/fee-structure', data),
  updateFee: (id, data) => api.post('/api/admin-staff/fee-structure', { ...data, id }),
  deleteFee: (id) => api.delete(`/api/admin-staff/fee-structure/${id}`),
  
  // Inventory Management
  getInventory: () => api.get('/api/admin-staff/inventory'),
  createInventoryItem: (data) => api.post('/api/admin-staff/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/api/admin-staff/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/api/admin-staff/inventory/${id}`),
  
  // Event Management
  getEvents: () => api.get('/api/admin-staff/events'),
  createEvent: (data) => api.post('/api/admin-staff/events', data),
  updateEvent: (id, data) => api.put(`/api/admin-staff/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/api/admin-staff/events/${id}`),
  
  // Communication Management
  getAnnouncements: () => api.get('/api/admin-staff/communications'),
  createAnnouncement: (data) => api.post('/api/admin-staff/communications', data),
  updateAnnouncement: (id, data) => api.put(`/api/admin-staff/communications/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/api/admin-staff/communications/${id}`),
  
  // Reports
  getReports: (type) => {
    if (type === 'enrollment') {
      return api.get('/api/admin-staff/reports/enrollment');
    } else if (type === 'staff') {
      return api.get('/api/admin-staff/reports/staff');
    } else if (type === 'fee-collection') {
      return api.get('/api/admin-staff/reports/fee-collection');
    }
    return api.get('/api/admin-staff/reports');
  },
  generateReport: (data) => api.post('/api/admin-staff/reports/generate', data),
  
  // Settings
  getSettings: () => api.get('/api/admin-staff/configuration/school-info'),
  updateSettings: (data) => api.put('/api/admin-staff/configuration/school-info', data),
};

export default adminService; 