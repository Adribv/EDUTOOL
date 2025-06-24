const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  feeStructureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure',
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
  amount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  components: [{
    name: String,
    amount: Number
  }],
  paymentDate: {
    type: Date,
    default: Date.now
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Online Payment'],
    required: true
  },
  transactionId: String,
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  paidBy: {
    name: String,
    relationship: String,
    contactNumber: String
  },
  remarks: String,
  isLatePayment: {
    type: Boolean,
    default: false
  },
  latePaymentFeeApplied: {
    type: Number,
    default: 0
  },
  discountsApplied: [{
    name: String,
    amount: Number
  }],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, { timestamps: true });

module.exports = mongoose.model('FeePayment', feePaymentSchema);