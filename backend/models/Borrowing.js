const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  borrowedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Overdue', 'Lost'],
    default: 'Active'
  },
  remarks: {
    type: String,
    trim: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  returnedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

// Index for efficient queries
borrowingSchema.index({ studentId: 1, status: 1 });
borrowingSchema.index({ bookId: 1, status: 1 });
borrowingSchema.index({ dueDate: 1, status: 1 });

// Virtual for checking if book is overdue
borrowingSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Active' && this.dueDate < new Date()) {
    return true;
  }
  return false;
});

// Virtual for calculating days overdue
borrowingSchema.virtual('daysOverdue').get(function() {
  if (this.isOverdue) {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Method to return book
borrowingSchema.methods.returnBook = function(returnedTo) {
  this.returnDate = new Date();
  this.status = 'Returned';
  this.returnedTo = returnedTo;
  return this.save();
};

// Method to mark as lost
borrowingSchema.methods.markAsLost = function() {
  this.status = 'Lost';
  return this.save();
};

// Pre-save middleware to update status based on due date
borrowingSchema.pre('save', function(next) {
  if (this.status === 'Active' && this.dueDate < new Date()) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('Borrowing', borrowingSchema); 