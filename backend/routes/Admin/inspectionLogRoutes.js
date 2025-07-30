const express = require('express');
const router = express.Router();
const inspectionLogController = require('../../controllers/Admin/inspectionLogController');
const { protect } = require('../../middlewares/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Create new inspection log
router.post('/', inspectionLogController.createInspectionLog);

// Get all inspection logs with filtering and pagination
router.get('/', inspectionLogController.getAllInspectionLogs);

// Get inspection statistics
router.get('/statistics', inspectionLogController.getInspectionStatistics);

// Get single inspection log by ID
router.get('/:id', inspectionLogController.getInspectionLogById);

// Update inspection log
router.put('/:id', inspectionLogController.updateInspectionLog);

// Delete inspection log
router.delete('/:id', inspectionLogController.deleteInspectionLog);



module.exports = router; 