const express = require('express');
const router = express.Router();
const inspectionLogController = require('../../controllers/Staff/inspectionLogController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Get inspection log statistics (Admin, VP, Principal can view) - Must come before /:id
router.get('/stats', verifyToken, permit('Admin', 'VP', 'Principal'), inspectionLogController.getInspectionLogStats);

// Get upcoming inspections (Admin, VP, Principal can view)
router.get('/upcoming', verifyToken, permit('Admin', 'VP', 'Principal'), inspectionLogController.getUpcomingInspections);

// Get all inspection logs (Admin, VP, Principal can view)
router.get('/', verifyToken, permit('Admin', 'VP', 'Principal'), inspectionLogController.getAllInspectionLogs);

// Get single inspection log (Admin, VP, Principal can view)
router.get('/:id', verifyToken, permit('Admin', 'VP', 'Principal'), inspectionLogController.getInspectionLogById);

// Create new inspection log (Admin only)
router.post('/', verifyToken, permit('Admin'), inspectionLogController.createInspectionLog);

// Update inspection log (VP and Principal only)
router.put('/:id', verifyToken, permit('VP', 'Principal'), inspectionLogController.updateInspectionLog);

// Update inspection log status (VP and Principal only)
router.patch('/:id/status', verifyToken, permit('VP', 'Principal'), inspectionLogController.updateInspectionLogStatus);

// Delete inspection log (Admin only)
router.delete('/:id', verifyToken, permit('Admin'), inspectionLogController.deleteInspectionLog);

module.exports = router; 