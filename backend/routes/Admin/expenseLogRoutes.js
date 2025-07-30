const express = require('express');
const router = express.Router();
const expenseLogController = require('../../controllers/Admin/expenseLogController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Test route for debugging (no authentication required)
router.get('/test/stats', (req, res) => {
  res.json({
    totalExpenses: 800000,
    totalCount: 15,
    averageAmount: 53333,
    approvedExpenses: 12
  });
});

router.get('/test/logs', (req, res) => {
  res.json({
    docs: [
      {
        _id: '1',
        serialNumber: 1,
        date: new Date(),
        expenseCategory: 'Utilities',
        description: 'Electricity bill payment',
        amount: 25000,
        paidTo: 'Electricity Board',
        voucherNo: 'VCH001',
        paymentMode: 'Bank Transfer',
        approvedBy: 'Principal',
        remarks: 'Monthly electricity bill',
        status: 'Approved'
      },
      {
        _id: '2',
        serialNumber: 2,
        date: new Date(),
        expenseCategory: 'Maintenance',
        description: 'Building maintenance',
        amount: 50000,
        paidTo: 'Maintenance Company',
        voucherNo: 'VCH002',
        paymentMode: 'Cheque',
        approvedBy: 'Principal',
        remarks: 'Quarterly maintenance',
        status: 'Approved'
      }
    ],
    totalDocs: 2,
    limit: 10,
    page: 1,
    totalPages: 1
  });
});

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