const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const incomeLogSchema = new mongoose.Schema({
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
  incomeSource: {
    type: String,
    required: true,
    enum: ['Fees', 'Donation', 'Grant', 'Event', 'Sponsorship', 'Fundraising', 'Investment', 'Other']
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
  receivedFrom: {
    type: String,
    required: true,
    trim: true
  },
  receiptNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Online Payment']
  },
  receivedBy: {
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
    enum: ['Pending', 'Confirmed', 'Rejected', 'Processed'],
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
incomeLogSchema.index({ date: -1 });
incomeLogSchema.index({ incomeSource: 1 });
incomeLogSchema.index({ paymentMode: 1 });
incomeLogSchema.index({ status: 1 });
incomeLogSchema.index({ createdBy: 1 });
incomeLogSchema.index({ receiptNo: 1 }, { unique: true });
incomeLogSchema.index({ serialNumber: 1 }, { unique: true });

// Auto-generate serial number
incomeLogSchema.pre('save', async function(next) {
  if (this.isNew && !this.serialNumber) {
    const lastIncome = await this.constructor.findOne({}, {}, { sort: { 'serialNumber': -1 } });
    this.serialNumber = lastIncome ? lastIncome.serialNumber + 1 : 1;
  }
  next();
});

// Auto-generate receipt number if not provided
incomeLogSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNo) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const lastIncome = await this.constructor.findOne({}, {}, { sort: { 'receiptNo': -1 } });
    
    if (lastIncome && lastIncome.receiptNo) {
      const lastNumber = parseInt(lastIncome.receiptNo.split('-')[2]) || 0;
      this.receiptNo = `INC-${year}${month}-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      this.receiptNo = `INC-${year}${month}-0001`;
    }
  }
  next();
});

// Calculate GST amounts
incomeLogSchema.pre('save', function(next) {
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
incomeLogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('IncomeLog', incomeLogSchema); 