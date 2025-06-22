import api from './api';

const adminService = {
  // Dashboard
  getDashboardData: () => api.get('/admin/dashboard'),
  
  // User Management
  getUsers: (role) => api.get(`/admin/users?role=${role}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Class Management
  getClasses: () => api.get('/admin/classes'),
  createClass: (data) => api.post('/admin/classes', data),
  updateClass: (id, data) => api.put(`/admin/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  
  // Subject Management
  getSubjects: () => api.get('/admin/subjects'),
  createSubject: (data) => api.post('/admin/subjects', data),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  
  // Schedule Management
  getSchedules: () => api.get('/admin/schedules'),
  createSchedule: (data) => api.post('/admin/schedules', data),
  updateSchedule: (id, data) => api.put(`/admin/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/admin/schedules/${id}`),
  
  // Fee Management
  getFees: () => api.get('/admin/fees'),
  createFee: (data) => api.post('/admin/fees', data),
  updateFee: (id, data) => api.put(`/admin/fees/${id}`, data),
  deleteFee: (id) => api.delete(`/admin/fees/${id}`),
  
  // Inventory Management
  getInventory: () => api.get('/admin/inventory'),
  createInventoryItem: (data) => api.post('/admin/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/admin/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/admin/inventory/${id}`),
  
  // Event Management
  getEvents: () => api.get('/admin/events'),
  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  
  // Communication Management
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  
  // Reports
  getReports: (type) => api.get(`/admin/reports?type=${type}`),
  generateReport: (data) => api.post('/admin/reports/generate', data),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export default adminService; 