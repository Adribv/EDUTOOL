const mongoose = require('mongoose');

const feeComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  isOptional: {
    type: Boolean,
    default: false
  }
});

const feeStructureSchema = new mongoose.Schema({
  academicYear: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3', 'Annual'],
    required: true
  },
  components: [feeComponentSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  latePaymentFee: {
    type: Number,
    default: 0
  },
  discounts: [{
    name: String,
    percentage: Number,
    criteria: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, { timestamps: true });

// Ensure unique fee structure for class in an academic year and term
feeStructureSchema.index({ academicYear: 1, class: 1, term: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);