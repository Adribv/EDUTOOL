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

module.exports = router; 