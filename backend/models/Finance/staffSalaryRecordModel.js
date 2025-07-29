const mongoose = require('mongoose');

const staffSalaryRecordSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  department: {
    type: String
  },
  month: {
    type: String,
    required: true,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: {
    houseRentAllowance: { type: Number, default: 0 },
    dearnessAllowance: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 }
  },
  deductions: {
    providentFund: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 }
  },
  grossSalary: {
    type: Number,
    required: true
  },
  netSalary: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Processing'],
    default: 'Pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cheque', 'Cash'],
    default: 'Bank Transfer'
  },
  transactionId: String,
  remarks: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approvedAt: Date,
  rejectionReason: String,
  attendance: {
    totalDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 }
  },
  performance: {
    rating: { type: Number, min: 1, max: 5 },
    comments: String
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String
  }
}, { timestamps: true });

// Index for efficient queries
staffSalaryRecordSchema.index({ department: 1 });
staffSalaryRecordSchema.index({ paymentStatus: 1 });
staffSalaryRecordSchema.index({ status: 1 });

// Ensure unique salary record per staff per month
staffSalaryRecordSchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });

// Pre-save middleware to ensure correct salary calculations
staffSalaryRecordSchema.pre('save', function(next) {
  // Calculate total allowances with proper type conversion
  const allowances = this.allowances || {};
  const totalAllowances = Object.values(allowances).reduce((sum, val) => {
    const numVal = parseFloat(val) || 0;
    return sum + numVal;
  }, 0);
  
  // Calculate total deductions with proper type conversion
  const deductions = this.deductions || {};
  const totalDeductions = Object.values(deductions).reduce((sum, val) => {
    const numVal = parseFloat(val) || 0;
    return sum + numVal;
  }, 0);
  
  // Ensure basic salary is a number
  const basicSalary = parseFloat(this.basicSalary) || 0;
  
  // Recalculate gross and net salary
  this.grossSalary = basicSalary + totalAllowances;
  this.netSalary = this.grossSalary - totalDeductions;
  
  // Ensure all values are numbers
  this.basicSalary = basicSalary;
  
  next();
});

// Pre-update middleware for findByIdAndUpdate operations
staffSalaryRecordSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  if (update.basicSalary || update.allowances || update.deductions) {
    const basicSalary = parseFloat(update.basicSalary) || 0;
    const allowances = update.allowances || {};
    const deductions = update.deductions || {};
    
    const totalAllowances = Object.values(allowances).reduce((sum, val) => {
      const numVal = parseFloat(val) || 0;
      return sum + numVal;
    }, 0);
    
    const totalDeductions = Object.values(deductions).reduce((sum, val) => {
      const numVal = parseFloat(val) || 0;
      return sum + numVal;
    }, 0);
    
    update.grossSalary = basicSalary + totalAllowances;
    update.netSalary = update.grossSalary - totalDeductions;
    update.basicSalary = basicSalary;
  }
  
  next();
});

module.exports = mongoose.model('StaffSalaryRecord', staffSalaryRecordSchema); 