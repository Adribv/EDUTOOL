const express = require('express');
const router = express.Router();
const incomeLogController = require('../../controllers/Admin/incomeLogController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Test route for debugging (no authentication required)
router.get('/test/stats', (req, res) => {
  res.json({
    totalIncome: 1500000,
    totalCount: 25,
    averageAmount: 60000,
    pendingIncome: 5
  });
});

router.get('/test/logs', (req, res) => {
  res.json({
    docs: [
      {
        _id: '1',
        serialNumber: 1,
        date: new Date(),
        incomeSource: 'Fees',
        description: 'Monthly tuition fees',
        amount: 50000,
        isGSTApplicable: true,
        gstRate: 18,
        gstAmount: 9000,
        cgstAmount: 4500,
        sgstAmount: 4500,
        igstAmount: 0,
        totalAmount: 59000,
        gstNumber: '27AABCA1234Z1Z5',
        receivedFrom: 'Student Parent',
        receiptNo: 'RCP001',
        paymentMode: 'Bank Transfer',
        receivedBy: 'Accountant',
        remarks: 'Regular monthly payment',
        status: 'Confirmed'
      },
      {
        _id: '2',
        serialNumber: 2,
        date: new Date(),
        incomeSource: 'Donation',
        description: 'Annual donation',
        amount: 100000,
        isGSTApplicable: false,
        gstRate: 0,
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 100000,
        gstNumber: '',
        receivedFrom: 'Local Business',
        receiptNo: 'RCP002',
        paymentMode: 'Cheque',
        receivedBy: 'Accountant',
        remarks: 'Annual sponsorship',
        status: 'Confirmed'
      }
    ],
    totalDocs: 2,
    limit: 10,
    page: 1,
    totalPages: 1
  });
});

// Test create route for debugging (no authentication required)
router.post('/test/create', (req, res) => {
  try {
    console.log('Test create income log:', req.body);
    res.json({
      success: true,
      message: 'Test income log created successfully',
      data: req.body
    });
  } catch (error) {
    console.error('Test create error:', error);
    res.status(500).json({
      success: false,
      message: 'Test create failed',
      error: error.message
    });
  }
});

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