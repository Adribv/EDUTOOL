const express = require('express');
const router = express.Router();
const accountantController = require('../controllers/Staff/Accountant/accountantController');

// Student fee status
router.get('/fee-status', accountantController.getAllStudentFeeStatus);
// Fee stats
router.get('/fee-stats', accountantController.getFeeStats);
// Transaction log
router.get('/transaction-log', accountantController.getTransactionLog);
// All fee payments with student details
router.get('/fee-payments', accountantController.getAllFeePayments);

module.exports = router; 