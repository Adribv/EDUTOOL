const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
  // GST Fields
  isGSTApplicable: {
    type: Boolean,
    default: false
  },
  gstRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  gstAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  cgstAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  sgstAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  igstAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  gstNumber: {
    type: String,
    trim: true,
    default: ''
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

// Calculate GST amounts
expenseLogSchema.pre('save', function(next) {
  if (this.isGSTApplicable && this.gstRate > 0 && this.amount > 0) {
    this.gstAmount = (this.amount * this.gstRate) / 100;
    
    // For intra-state transactions (CGST + SGST)
    if (this.gstNumber && this.gstNumber.length > 0) {
      // If GST number is provided, assume it's intra-state
      this.cgstAmount = this.gstAmount / 2;
      this.sgstAmount = this.gstAmount / 2;
      this.igstAmount = 0;
    } else {
      // For inter-state transactions (IGST)
      this.igstAmount = this.gstAmount;
      this.cgstAmount = 0;
      this.sgstAmount = 0;
    }
    
    this.totalAmount = this.amount + this.gstAmount;
  } else {
    // Reset GST amounts if not applicable
    this.gstAmount = 0;
    this.cgstAmount = 0;
    this.sgstAmount = 0;
    this.igstAmount = 0;
    this.totalAmount = this.amount;
  }
  next();
});

// Add pagination plugin
expenseLogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ExpenseLog', expenseLogSchema); 