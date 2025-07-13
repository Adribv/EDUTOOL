const mongoose = require('mongoose');

const studentFeeRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3', 'Annual'],
    required: true
  },
  feeType: {
    type: String,
    required: true,
    enum: ['Tuition', 'Transportation', 'Library', 'Laboratory', 'Sports', 'Other']
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Partial'],
    default: 'Pending'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Online Payment']
  },
  receiptNumber: String,
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
  isLatePayment: {
    type: Boolean,
    default: false
  },
  latePaymentFee: {
    type: Number,
    default: 0
  },
  discountsApplied: [{
    name: String,
    amount: Number,
    reason: String
  }],
  parentContact: {
    name: String,
    phone: String,
    email: String
  }
}, { timestamps: true });

// Index for efficient queries
studentFeeRecordSchema.index({ studentId: 1, academicYear: 1, term: 1 });
studentFeeRecordSchema.index({ class: 1, section: 1 });
studentFeeRecordSchema.index({ paymentStatus: 1 });
studentFeeRecordSchema.index({ status: 1 });

module.exports = mongoose.model('StudentFeeRecord', studentFeeRecordSchema); 