const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['Operations', 'Maintenance', 'Salary', 'Equipment', 'Other'],
    default: 'Other',
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  approvedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema); 