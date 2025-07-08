const FeePayment = require('../../../models/Finance/feePaymentModel');
const Expense = require('../../../models/Finance/expenseModel');
const ApprovalRequest = require('../../../models/Staff/HOD/approvalRequest.model');
const mongoose = require('mongoose');

// GET /api/accountant/summary
exports.getSummary = async (req, res) => {
  try {
    // Total income (approved / completed fee payments)
    const incomeAgg = await FeePayment.aggregate([
      { $match: { status: { $in: ['Completed'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    const totalIncome = incomeAgg[0]?.total || 0;

    // Total dues (pending / failed etc.)
    const duesAgg = await FeePayment.aggregate([
      { $match: { status: { $in: ['Pending'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$amountPaid'] } } } },
    ]);
    const totalDues = duesAgg[0]?.total || 0;

    // Total expenses (approved only)
    const expenseAgg = await Expense.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpenses = expenseAgg[0]?.total || 0;

    const profitLoss = totalIncome - totalExpenses;

    res.json({
      income: totalIncome,
      expenses: totalExpenses,
      dues: totalDues,
      profitLoss,
    });
  } catch (err) {
    console.error('Error fetching accountant summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/accountant/expenses
exports.createExpense = async (req, res) => {
  try {
    const { title, description, category, amount, date } = req.body;
    const expense = await Expense.create({
      title,
      description,
      category,
      amount,
      date,
      createdBy: req.user.id,
      status: 'Pending',
    });

    // Create approval request for Principal
    await ApprovalRequest.create({
      requesterId: req.user.id,
      requesterName: req.user.name || 'Accountant',
      requestType: 'Budget',
      title: `Expense Approval: ${title}`,
      description: description || `Approve expense of ₹${amount}`,
      requestData: { expenseId: expense._id },
      status: 'Pending',
      currentApprover: 'Principal',
      approvalHistory: [],
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/accountant/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, amount, date } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending expenses can be updated' });
    }
    // Update allowed fields
    if (title) expense.title = title;
    if (description) expense.description = description;
    if (category) expense.category = category;
    if (amount) expense.amount = amount;
    if (date) expense.date = date;

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility to generate random integer in range
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// POST /api/accountant/sample-data
exports.generateSampleData = async (req, res) => {
  try {
    // Clear existing sample expenses (optional)
    await Expense.deleteMany({});

    const categories = ['Operations', 'Maintenance', 'Salary', 'Equipment', 'Other'];
    const expenseBulk = [];
    for (let i = 0; i < 120; i++) {
      expenseBulk.push({
        _id: new mongoose.Types.ObjectId(),
        title: `Sample Expense ${i + 1}`,
        description: 'Auto-generated sample expense',
        category: categories[i % categories.length],
        amount: randInt(5000, 50000),
        date: new Date(Date.now() - randInt(0, 30) * 86400000),
        status: 'Approved',
        createdBy: req.user.id,
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });
    }
    await Expense.insertMany(expenseBulk);

    // FeePayments
    await FeePayment.deleteMany({});
    const feeBulk = [];
    for (let i = 0; i < 120; i++) {
      feeBulk.push({
        studentId: new mongoose.Types.ObjectId(),
        feeStructureId: new mongoose.Types.ObjectId(),
        academicYear: '2024-2025',
        term: 'Annual',
        amount: 40000,
        amountPaid: 40000,
        components: [{ name: 'Tuition', amount: 30000 }],
        paymentDate: new Date(Date.now() - randInt(0, 60) * 86400000),
        paymentMethod: 'Cash',
        transactionId: `TXN${Date.now()}${i}`,
        receiptNumber: `REC${Date.now()}${i}`,
        status: 'Completed',
        paidBy: { name: 'Parent', relationship: 'Father', contactNumber: '9999999999' },
      });
    }
    await FeePayment.insertMany(feeBulk);

    res.json({ message: 'Sample data generated (120 expenses & 120 payments)' });
  } catch (err) {
    console.error('Sample data generation error:', err);
    res.status(500).json({ message: 'Server error generating sample data' });
  }
};

// GET /api/accountant/incomes
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await FeePayment.find().sort({ paymentDate: -1 });
    res.json(incomes);
  } catch (err) {
    console.error('Error fetching incomes:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 