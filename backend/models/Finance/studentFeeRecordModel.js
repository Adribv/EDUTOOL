const mongoose = require('mongoose');

const studentFeeRecordSchema = new mongoose.Schema({
  // Basic student information
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
  admissionNumber: {
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
  
  // Academic information
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3', 'Annual', 'Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
    required: true
  },
  
  // Parent/Guardian information
  parentName: {
    type: String,
    required: true
  },
  parentContact: {
    name: String,
    phone: String,
    email: String
  },
  contactNumber: {
    type: String,
    required: true
  },
  
  // Fee information
  totalFee: {
    type: Number,
    required: true
  },
  paymentReceived: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Partial'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Online Payment', 'UPI', 'Other'],
    required: false
  },
  paymentDate: {
    type: Date
  },
  receiptNumber: String,
  transactionId: String,
  
  // Reminder and follow-up tracking
  reminderDate: {
    type: Date
  },
  followUpDate: {
    type: Date
  },
  noticeIssueDate: {
    type: Date
  },
  modeOfContact: {
    type: String,
    enum: ['Phone', 'Email', 'SMS', 'WhatsApp', 'In Person', 'Letter', 'Other'],
    required: false
  },
  
  // Additional information
  remarks: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  
  // Audit fields
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
  
  // Late payment tracking
  isLatePayment: {
    type: Boolean,
    default: false
  },
  latePaymentFee: {
    type: Number,
    default: 0
  },
  
  // Discounts
  discountsApplied: [{
    name: String,
    amount: Number,
    reason: String
  }]
}, { timestamps: true });

// Index for efficient queries
studentFeeRecordSchema.index({ studentId: 1, academicYear: 1, term: 1 });
studentFeeRecordSchema.index({ class: 1, section: 1 });
studentFeeRecordSchema.index({ paymentStatus: 1 });
studentFeeRecordSchema.index({ status: 1 });
studentFeeRecordSchema.index({ admissionNumber: 1 });
studentFeeRecordSchema.index({ dueDate: 1 });
studentFeeRecordSchema.index({ reminderDate: 1 });
studentFeeRecordSchema.index({ followUpDate: 1 });

// Pre-save middleware to calculate balance due
studentFeeRecordSchema.pre('save', function(next) {
  if (this.totalFee && this.paymentReceived !== undefined) {
    this.balanceDue = this.totalFee - this.paymentReceived;
  }
  next();
});

module.exports = mongoose.model('StudentFeeRecord', studentFeeRecordSchema); 