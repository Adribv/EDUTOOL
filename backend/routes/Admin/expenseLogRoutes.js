const express = require('express');
const router = express.Router();
const expenseLogController = require('../../controllers/Admin/expenseLogController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Get expense log statistics (Accountant, Admin, AdminStaff can view)
router.get('/stats', verifyToken, permit('Accountant', 'Admin', 'AdminStaff'), expenseLogController.getExpenseLogStats);

// Get all expense logs with pagination and filtering (Accountant, Admin, AdminStaff can view)
router.get('/', verifyToken, permit('Accountant', 'Admin', 'AdminStaff'), expenseLogController.getAllExpenseLogs);

// Get expense log by ID (Accountant, Admin, AdminStaff can view)
router.get('/:id', verifyToken, permit('Accountant', 'Admin', 'AdminStaff'), expenseLogController.getExpenseLogById);

// Create new expense log (Accountant, AdminStaff only)
router.post('/', verifyToken, permit('Accountant', 'AdminStaff'), expenseLogController.createExpenseLog);

// Update expense log (Accountant, AdminStaff only)
router.put('/:id', verifyToken, permit('Accountant', 'AdminStaff'), expenseLogController.updateExpenseLog);

// Update expense log status (Accountant, AdminStaff only)
router.patch('/:id/status', verifyToken, permit('Accountant', 'AdminStaff'), expenseLogController.updateExpenseLogStatus);

// Delete expense log (Accountant, AdminStaff only)
router.delete('/:id', verifyToken, permit('Accountant', 'AdminStaff'), expenseLogController.deleteExpenseLog);

module.exports = router; 