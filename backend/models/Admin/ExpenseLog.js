const mongoose = require('mongoose');

const expenseLogSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  expenseCategory: {
    type: String,
    required: true,
    enum: ['Maintenance', 'Salary', 'Equipment', 'Utilities', 'Transportation', 'Office Supplies', 'Events', 'Training', 'Technology', 'Miscellaneous']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card']
  },
  paidTo: {
    type: String,
    required: true,
    trim: true
  },
  voucherNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  approvedBy: {
    type: String,
    required: true,
    trim: true
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  uploadDocument: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Additional fields for tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending'
  },
  fiscalYear: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: false
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Indexes for better performance
expenseLogSchema.index({ date: -1 });
expenseLogSchema.index({ expenseCategory: 1 });
expenseLogSchema.index({ paymentMode: 1 });
expenseLogSchema.index({ status: 1 });
expenseLogSchema.index({ createdBy: 1 });
expenseLogSchema.index({ voucherNo: 1 }, { unique: true });
expenseLogSchema.index({ serialNumber: 1 }, { unique: true });

// Auto-generate serial number
expenseLogSchema.pre('save', async function(next) {
  if (this.isNew && !this.serialNumber) {
    const lastExpense = await this.constructor.findOne({}, {}, { sort: { 'serialNumber': -1 } });
    this.serialNumber = lastExpense ? lastExpense.serialNumber + 1 : 1;
  }
  next();
});

// Auto-generate voucher number if not provided
expenseLogSchema.pre('save', async function(next) {
  if (this.isNew && !this.voucherNo) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const lastExpense = await this.constructor.findOne({}, {}, { sort: { 'voucherNo': -1 } });
    
    if (lastExpense && lastExpense.voucherNo) {
      const lastNumber = parseInt(lastExpense.voucherNo.split('-')[2]) || 0;
      this.voucherNo = `VOU-${year}${month}-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      this.voucherNo = `VOU-${year}${month}-0001`;
    }
  }
  next();
});

module.exports = mongoose.model('ExpenseLog', expenseLogSchema); 