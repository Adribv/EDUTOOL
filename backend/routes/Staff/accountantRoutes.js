const express = require('express');
const router = express.Router();

const accountantController = require('../../controllers/Staff/Accountant/accountantController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// All accountant routes require authentication
router.use(verifyToken);

// Dashboard summary
router.get('/summary', permit('Accountant'), accountantController.getSummary);

// Expense management
router.get('/expenses', permit('Accountant', 'Principal'), accountantController.getExpenses);
router.post('/expenses', permit('Accountant'), accountantController.createExpense);
router.put('/expenses/:id', permit('Accountant'), accountantController.updateExpense);

router.get('/incomes', permit('Accountant','Principal'), accountantController.getIncomes);

router.post('/sample-data', permit('Accountant','AdminStaff'), accountantController.generateSampleData);

// ENHANCED SALARY TEMPLATE MANAGEMENT ROUTES
router.get('/salary-templates', permit('Accountant'), accountantController.getSalaryTemplates);
router.get('/salary-templates/:id', permit('Accountant'), accountantController.getSalaryTemplateById);
router.post('/salary-templates', permit('Accountant'), accountantController.createSalaryTemplate);
router.put('/salary-templates/:id', permit('Accountant'), accountantController.updateSalaryTemplate);
router.delete('/salary-templates/:id', permit('Accountant'), accountantController.deleteSalaryTemplate);
router.get('/salary-template-stats', permit('Accountant'), accountantController.getSalaryTemplateStats);
router.get('/available-roles', permit('Accountant'), accountantController.getAvailableRoles);

// STAFF MANAGEMENT BY ROLE
router.get('/staff-by-role/:role', permit('Accountant'), accountantController.getStaffByRole);
router.get('/role-statistics', permit('Accountant'), accountantController.getRoleStatistics);

// TEMPLATE APPLICATION
router.post('/apply-template-to-staff', permit('Accountant'), accountantController.applyTemplateToStaff);
router.get('/template-preview/:templateId', permit('Accountant'), accountantController.getTemplatePreview);

// STAFF SALARY MANAGEMENT ROUTES

// Salary templates and staff management
router.get('/staff-salary-templates', permit('Accountant'), accountantController.getSalaryTemplates);
router.get('/staff-list', permit('Accountant'), accountantController.getStaffList);
router.get('/staff-salary-history/:staffId', permit('Accountant'), accountantController.getStaffSalaryHistory);

// Salary record management
router.post('/create-salary-record', permit('Accountant'), accountantController.createSalaryRecord);
router.put('/update-salary-record/:id', permit('Accountant'), accountantController.updateSalaryRecord);
router.post('/bulk-salary-creation', permit('Accountant'), accountantController.bulkSalaryCreation);

// Analytics and reports
router.get('/pending-salary-approvals', permit('Accountant'), accountantController.getPendingSalaryApprovals);

module.exports = router; 