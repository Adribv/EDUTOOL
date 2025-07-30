const IncomeLog = require('../../models/Admin/IncomeLog');
const Staff = require('../../models/Staff/staffModel');

// Get all income logs with pagination and filtering
exports.getAllIncomeLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, source, paymentMode, status, startDate, endDate } = req.query;
    
    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { receivedFrom: { $regex: search, $options: 'i' } },
        { receiptNo: { $regex: search, $options: 'i' } },
        { receivedBy: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by income source
    if (source) {
      query.incomeSource = source;
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
    
    const incomeLogs = await IncomeLog.paginate(query, options);
    
    res.json(incomeLogs);
  } catch (error) {
    console.error('Error fetching income logs:', error);
    res.status(500).json({ message: 'Error fetching income logs' });
  }
};

// Get income log by ID
exports.getIncomeLogById = async (req, res) => {
  try {
    const incomeLog = await IncomeLog.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('lastModifiedBy', 'name email role');
    
    if (!incomeLog) {
      return res.status(404).json({ message: 'Income log not found' });
    }
    
    res.json(incomeLog);
  } catch (error) {
    console.error('Error fetching income log:', error);
    res.status(500).json({ message: 'Error fetching income log' });
  }
};

// Create new income log (Accountant only)
exports.createIncomeLog = async (req, res) => {
  try {
    const incomeData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const incomeLog = new IncomeLog(incomeData);
    await incomeLog.save();
    
    const populatedIncomeLog = await IncomeLog.findById(incomeLog._id)
      .populate('createdBy', 'name email role');
    
    res.status(201).json(populatedIncomeLog);
  } catch (error) {
    console.error('Error creating income log:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Receipt number or serial number already exists' });
    }
    res.status(500).json({ message: 'Error creating income log' });
  }
};

// Update income log (Accountant only)
exports.updateIncomeLog = async (req, res) => {
  try {
    const incomeLog = await IncomeLog.findById(req.params.id);
    
    if (!incomeLog) {
      return res.status(404).json({ message: 'Income log not found' });
    }
    
    // Only allow updates if status is Pending
    if (incomeLog.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot update income log that is not in Pending status' });
    }
    
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date()
    };
    
    const updatedIncomeLog = await IncomeLog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');
    
    res.json(updatedIncomeLog);
  } catch (error) {
    console.error('Error updating income log:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Receipt number or serial number already exists' });
    }
    res.status(500).json({ message: 'Error updating income log' });
  }
};

// Delete income log (Accountant only)
exports.deleteIncomeLog = async (req, res) => {
  try {
    const incomeLog = await IncomeLog.findById(req.params.id);
    
    if (!incomeLog) {
      return res.status(404).json({ message: 'Income log not found' });
    }
    
    // Only allow deletion if status is Pending
    if (incomeLog.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot delete income log that is not in Pending status' });
    }
    
    await IncomeLog.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Income log deleted successfully' });
  } catch (error) {
    console.error('Error deleting income log:', error);
    res.status(500).json({ message: 'Error deleting income log' });
  }
};

// Get income log statistics
exports.getIncomeLogStats = async (req, res) => {
  try {
    const stats = await IncomeLog.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    const sourceStats = await IncomeLog.aggregate([
      {
        $group: {
          _id: '$incomeSource',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    const paymentModeStats = await IncomeLog.aggregate([
      {
        $group: {
          _id: '$paymentMode',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    const statusStats = await IncomeLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const monthlyStats = await IncomeLog.aggregate([
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
      overview: stats[0] || { totalIncome: 0, totalCount: 0, averageAmount: 0 },
      sourceStats,
      paymentModeStats,
      statusStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching income log stats:', error);
    res.status(500).json({ message: 'Error fetching income log statistics' });
  }
};

// Update income log status
exports.updateIncomeLogStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const incomeLog = await IncomeLog.findByIdAndUpdate(
      req.params.id,
      {
        status,
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');
    
    if (!incomeLog) {
      return res.status(404).json({ message: 'Income log not found' });
    }
    
    res.json(incomeLog);
  } catch (error) {
    console.error('Error updating income log status:', error);
    res.status(500).json({ message: 'Error updating income log status' });
  }
}; 