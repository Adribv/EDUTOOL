const express = require('express');
const router = express.Router();
const auditLogController = require('../../controllers/Admin/auditLogController');
const { protect } = require('../../middlewares/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Create new audit log
router.post('/', auditLogController.createAuditLog);

// Get all audit logs with filtering and pagination
router.get('/', auditLogController.getAllAuditLogs);

// Get audit statistics
router.get('/statistics', auditLogController.getAuditStatistics);

// Get single audit log by ID
router.get('/:id', auditLogController.getAuditLogById);

// Update audit log
router.put('/:id', auditLogController.updateAuditLog);

// Delete audit log
router.delete('/:id', auditLogController.deleteAuditLog);

module.exports = router; 