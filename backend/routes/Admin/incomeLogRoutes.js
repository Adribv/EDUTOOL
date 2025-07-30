const express = require('express');
const router = express.Router();
const incomeLogController = require('../../controllers/Admin/incomeLogController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Get income log statistics (Accountant, Admin can view)
router.get('/stats', verifyToken, permit('Accountant', 'Admin'), incomeLogController.getIncomeLogStats);

// Get all income logs with pagination and filtering (Accountant, Admin can view)
router.get('/', verifyToken, permit('Accountant', 'Admin'), incomeLogController.getAllIncomeLogs);

// Get income log by ID (Accountant, Admin can view)
router.get('/:id', verifyToken, permit('Accountant', 'Admin'), incomeLogController.getIncomeLogById);

// Create new income log (Accountant only)
router.post('/', verifyToken, permit('Accountant'), incomeLogController.createIncomeLog);

// Update income log (Accountant only)
router.put('/:id', verifyToken, permit('Accountant'), incomeLogController.updateIncomeLog);

// Update income log status (Accountant only)
router.patch('/:id/status', verifyToken, permit('Accountant'), incomeLogController.updateIncomeLogStatus);

// Delete income log (Accountant only)
router.delete('/:id', verifyToken, permit('Accountant'), incomeLogController.deleteIncomeLog);

module.exports = router; 