import api from './api';

const adminService = {
  // Dashboard
  getDashboardData: () => api.get('/admin-staff/dashboard'),
  
  // User Management
  getUsers: (role) => {
    if (role === 'student') {
      return api.get('/admin-staff/students');
    } else if (role === 'parent') {
      return api.get('/admin-staff/parents');
    } else {
      return api.get('/admin-staff/staff');
    }
  },
  createUser: (data) => {
    const role = (data.role || '').toLowerCase();
    if (role === 'student') {
      return api.post('/admin-staff/students', data);
    } else if (role === 'parent') {
      return api.post('/admin-staff/parents', data);
    } else {
      return api.post('/admin-staff/staff', data);
    }
  },
  updateUser: (id, data) => {
    const role = (data.role || '').toLowerCase();
    if (role === 'student') {
      return api.put(`/admin-staff/students/${id}`, data);
    } else if (role === 'parent') {
      return api.put(`/admin-staff/parents/${id}`, data);
    } else {
      return api.put(`/admin-staff/staff/${id}`, data);
    }
  },
  deleteUser: (id, role) => {
    if (role === 'student') {
      return api.delete(`/admin-staff/students/${id}`);
    } else if (role === 'parent') {
      return api.delete(`/admin-staff/parents/${id}`);
    } else {
      return api.delete(`/admin-staff/staff/${id}`);
    }
  },
  
  // Class Management
  getClasses: () => api.get('/admin-staff/classes'),
  createClass: (data) => api.post('/admin-staff/classes', data),
  updateClass: (id, data) => api.put(`/admin-staff/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/admin-staff/classes/${id}`),
  getTeachers: () => api.get('/admin-staff/staff/teachers/public'),
  
  // Subject Management
  getSubjects: () => api.get('/admin-staff/subjects'),
  createSubject: (data) => api.post('/admin-staff/subjects', data),
  updateSubject: (id, data) => api.put(`/admin-staff/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin-staff/subjects/${id}`),
  
  // Schedule Management
  getSchedules: () => api.get('/admin-staff/schedules'),
  createSchedule: (data) => api.post('/admin-staff/schedules', data),
  updateSchedule: (id, data) => api.put(`/admin-staff/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/admin-staff/schedules/${id}`),
  
  // Fee Management
  getFees: () => api.get('/admin-staff/fee-structure'),
  createFee: (data) => api.post('/admin-staff/fee-structure', data),
  updateFee: (id, data) => api.post('/admin-staff/fee-structure', { ...data, id }),
  deleteFee: (id) => api.delete(`/admin-staff/fee-structure/${id}`),
  
  // Inventory Management
  getInventory: () => api.get('/admin-staff/inventory'),
  createInventoryItem: (data) => api.post('/admin-staff/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/admin-staff/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/admin-staff/inventory/${id}`),
  exportInventory: () => api.get('/admin-staff/inventory/export', { responseType: 'blob' }),
  bulkImportInventory: (data) => api.post('/admin-staff/inventory/bulk-import', data),
  
  // Supplier Management
  getSuppliers: () => api.get('/admin-staff/suppliers'),
  addSupplier: (data) => api.post('/admin-staff/suppliers', data),
  updateSupplier: (id, data) => api.put(`/admin-staff/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/admin-staff/suppliers/${id}`),
  
  // Supply Requests
  getSupplyRequests: () => api.get('/admin-staff/supply-requests'),
  createSupplyRequest: (data) => api.post('/admin-staff/supply-requests', data),
  updateSupplyRequestStatus: (id, status) => api.put(`/admin-staff/supply-requests/${id}/status`, { status }),
  deleteSupplyRequest: (id) => api.delete(`/admin-staff/supply-requests/${id}`),
  
  // Event Management
  getEvents: () => api.get('/admin-staff/events'),
  createEvent: (data) => api.post('/admin-staff/events', data),
  updateEvent: (id, data) => api.put(`/admin-staff/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin-staff/events/${id}`),
  
  // Communication Management
  getAnnouncements: () => api.get('/admin-staff/communications'),
  createAnnouncement: (data) => api.post('/admin-staff/communications', data),
  updateAnnouncement: (id, data) => api.put(`/admin-staff/communications/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin-staff/communications/${id}`),
  
  // Reports
  getReports: (type) => {
    if (type === 'enrollment') {
      return api.get('/admin-staff/reports/enrollment');
    } else if (type === 'staff') {
      return api.get('/admin-staff/reports/staff');
    } else if (type === 'fee-collection') {
      return api.get('/admin-staff/reports/fee-collection');
    }
    return api.get('/admin-staff/reports');
  },
  generateReport: (data) => api.post('/admin-staff/reports/generate', data),
  
  // Settings
  getSettings: () => api.get('/admin-staff/configuration/school-info'),
  updateSettings: (data) => api.put('/admin-staff/configuration/school-info', data),
};

export default adminService; 