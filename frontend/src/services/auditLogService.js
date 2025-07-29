import api from './api';

const auditLogService = {
  getAll: () => api.get('/admin/audit-logs'),
  getById: (id) => api.get(`/admin/audit-logs/${id}`),
  create: (data) => api.post('/admin/audit-logs', data),
  update: (id, data) => api.put(`/admin/audit-logs/${id}`, data),
  remove: (id) => api.delete(`/admin/audit-logs/${id}`),
};

export default auditLogService; 