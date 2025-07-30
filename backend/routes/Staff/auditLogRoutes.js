const express = require('express');
const router = express.Router();
const auditLogController = require('../../controllers/Staff/auditLogController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Get audit log statistics (Admin, AdminStaff, VP, Principal can view) - Must come before /:id
router.get('/stats', verifyToken, permit('Admin', 'AdminStaff', 'VP', 'Principal'), auditLogController.getAuditLogStats);

// Get all audit logs (Admin, AdminStaff, VP, Principal can view)
router.get('/', verifyToken, permit('Admin', 'AdminStaff', 'VP', 'Principal'), auditLogController.getAllAuditLogs);

// Get single audit log (Admin, AdminStaff, VP, Principal can view)
router.get('/:id', verifyToken, permit('Admin', 'AdminStaff', 'VP', 'Principal'), auditLogController.getAuditLogById);

// Create new audit log (Admin only)
router.post('/', verifyToken, permit('Admin', 'AdminStaff'), auditLogController.createAuditLog);

// Update audit log (VP and Principal only)
router.put('/:id', verifyToken, permit('VP', 'Principal'), auditLogController.updateAuditLog);

// Update audit log status (VP and Principal only)
router.patch('/:id/status', verifyToken, permit('VP', 'Principal'), auditLogController.updateAuditLogStatus);

// Delete audit log (Admin only)
router.delete('/:id', verifyToken, permit('Admin', 'AdminStaff'), auditLogController.deleteAuditLog);

module.exports = router; 