const ExpenseLog = require('../../models/Admin/ExpenseLog');
const Staff = require('../../models/Staff/staffModel');

// Get all expense logs with pagination and filtering
exports.getAllExpenseLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, paymentMode, status, startDate, endDate } = req.query;
    
    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { paidTo: { $regex: search, $options: 'i' } },
        { voucherNo: { $regex: search, $options: 'i' } },
        { approvedBy: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category) {
      query.expenseCategory = category;
    }
    
    // Filter by payment mode
    if (paymentMode) {
      query.paymentMode = paymentMode;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1 },
      populate: [
        { path: 'createdBy', select: 'name email role' },
        { path: 'lastModifiedBy', select: 'name email role' }
      ]
    };
    
    const expenseLogs = await ExpenseLog.paginate(query, options);
    
    res.json(expenseLogs);
  } catch (error) {
    console.error('Error fetching expense logs:', error);
    res.status(500).json({ message: 'Error fetching expense logs' });
  }
};

// Get expense log by ID
exports.getExpenseLogById = async (req, res) => {
  try {
    const expenseLog = await ExpenseLog.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('lastModifiedBy', 'name email role');
    
    if (!expenseLog) {
      return res.status(404).json({ message: 'Expense log not found' });
    }
    
    res.json(expenseLog);
  } catch (error) {
    console.error('Error fetching expense log:', error);
    res.status(500).json({ message: 'Error fetching expense log' });
  }
};

// Create new expense log (Accountant only)
exports.createExpenseLog = async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const expenseLog = new ExpenseLog(expenseData);
    await expenseLog.save();
    
    const populatedExpenseLog = await ExpenseLog.findById(expenseLog._id)
      .populate('createdBy', 'name email role');
    
    res.status(201).json(populatedExpenseLog);
  } catch (error) {
    console.error('Error creating expense log:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Voucher number or serial number already exists' });
    }
    res.status(500).json({ message: 'Error creating expense log' });
  }
};

// Update expense log (Accountant only)
exports.updateExpenseLog = async (req, res) => {
  try {
    const expenseLog = await ExpenseLog.findById(req.params.id);
    
    if (!expenseLog) {
      return res.status(404).json({ message: 'Expense log not found' });
    }
    
    // Only allow updates if status is Pending
    if (expenseLog.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot update expense log that is not in Pending status' });
    }
    
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date()
    };
    
    const updatedExpenseLog = await ExpenseLog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');
    
    res.json(updatedExpenseLog);
  } catch (error) {
    console.error('Error updating expense log:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Voucher number or serial number already exists' });
    }
    res.status(500).json({ message: 'Error updating expense log' });
  }
};

// Delete expense log (Accountant only)
exports.deleteExpenseLog = async (req, res) => {
  try {
    const expenseLog = await ExpenseLog.findById(req.params.id);
    
    if (!expenseLog) {
      return res.status(404).json({ message: 'Expense log not found' });
    }
    
    // Only allow deletion if status is Pending
    if (expenseLog.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot delete expense log that is not in Pending status' });
    }
    
    await ExpenseLog.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Expense log deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense log:', error);
    res.status(500).json({ message: 'Error deleting expense log' });
  }
};

// Get expense log statistics
exports.getExpenseLogStats = async (req, res) => {
  try {
    const stats = await ExpenseLog.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    const categoryStats = await ExpenseLog.aggregate([
      {
        $group: {
          _id: '$expenseCategory',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    const paymentModeStats = await ExpenseLog.aggregate([
      {
        $group: {
          _id: '$paymentMode',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    const statusStats = await ExpenseLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const monthlyStats = await ExpenseLog.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      overview: stats[0] || { totalExpenses: 0, totalCount: 0, averageAmount: 0 },
      categoryStats,
      paymentModeStats,
      statusStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching expense log stats:', error);
    res.status(500).json({ message: 'Error fetching expense log statistics' });
  }
};

// Update expense log status
exports.updateExpenseLogStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const expenseLog = await ExpenseLog.findByIdAndUpdate(
      req.params.id,
      {
        status,
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');
    
    if (!expenseLog) {
      return res.status(404).json({ message: 'Expense log not found' });
    }
    
    res.json(expenseLog);
  } catch (error) {
    console.error('Error updating expense log status:', error);
    res.status(500).json({ message: 'Error updating expense log status' });
  }
}; 