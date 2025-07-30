const express = require('express');
const router = express.Router();
const expenseLogController = require('../../controllers/Admin/expenseLogController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Get expense log statistics (Accountant, Admin can view)
router.get('/stats', verifyToken, permit('Accountant', 'Admin'), expenseLogController.getExpenseLogStats);

// Get all expense logs with pagination and filtering (Accountant, Admin can view)
router.get('/', verifyToken, permit('Accountant', 'Admin'), expenseLogController.getAllExpenseLogs);

// Get expense log by ID (Accountant, Admin can view)
router.get('/:id', verifyToken, permit('Accountant', 'Admin'), expenseLogController.getExpenseLogById);

// Create new expense log (Accountant only)
router.post('/', verifyToken, permit('Accountant'), expenseLogController.createExpenseLog);

// Update expense log (Accountant only)
router.put('/:id', verifyToken, permit('Accountant'), expenseLogController.updateExpenseLog);

// Update expense log status (Accountant only)
router.patch('/:id/status', verifyToken, permit('Accountant'), expenseLogController.updateExpenseLogStatus);

// Delete expense log (Accountant only)
router.delete('/:id', verifyToken, permit('Accountant'), expenseLogController.deleteExpenseLog);

module.exports = router; 