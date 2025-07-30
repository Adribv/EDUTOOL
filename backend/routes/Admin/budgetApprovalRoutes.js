const express = require('express');
const router = express.Router();
const budgetApprovalController = require('../../controllers/Admin/budgetApprovalController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Get budget approval statistics (Admin, Accountant, Principal can view) - Must come before /:id
router.get('/stats', verifyToken, permit('Admin', 'Accountant', 'Principal'), budgetApprovalController.getBudgetApprovalStats);

// Get all budget approvals (Admin, Accountant, Principal can view)
router.get('/', verifyToken, permit('Admin', 'Accountant', 'Principal'), budgetApprovalController.getAllBudgetApprovals);

// Get single budget approval (Admin, Accountant, Principal can view)
router.get('/:id', verifyToken, permit('Admin', 'Accountant', 'Principal'), budgetApprovalController.getBudgetApprovalById);

// Create new budget approval (Admin and Accountant only)
router.post('/', verifyToken, permit('Admin', 'AdminStaff', 'Accountant'), budgetApprovalController.createBudgetApproval);

// Update budget approval (Admin and Accountant only)
router.put('/:id', verifyToken, permit('Admin', 'AdminStaff', 'Accountant'), budgetApprovalController.updateBudgetApproval);

// Submit budget approval for review (Admin and Accountant only)
router.patch('/:id/submit', verifyToken, permit('Admin', 'AdminStaff', 'Accountant'), budgetApprovalController.submitBudgetApproval);

// Approve budget approval (Principal only)
router.patch('/:id/approve', verifyToken, permit('Principal'), budgetApprovalController.approveBudgetApproval);

// Reject budget approval (Principal only)
router.patch('/:id/reject', verifyToken, permit('Principal'), budgetApprovalController.rejectBudgetApproval);

// Delete budget approval (Admin only)
router.delete('/:id', verifyToken, permit('Admin'), budgetApprovalController.deleteBudgetApproval);

// Download budget approval PDF (Admin, Accountant, Principal can download)
router.get('/:id/download-pdf', verifyToken, permit('Admin', 'Accountant', 'Principal'), budgetApprovalController.downloadBudgetApprovalPDF);

module.exports = router; 