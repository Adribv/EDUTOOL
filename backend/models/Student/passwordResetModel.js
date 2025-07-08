const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resetToken: {
    type: String,
    required: true
  },
  resetTokenExpiry: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Expired'],
    default: 'Pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  requestedBy: {
    type: String,
    enum: ['Student', 'Parent', 'Admin'],
    required: true
  },
  remarks: String
}, { timestamps: true });

// Index for better query performance
passwordResetSchema.index({ resetToken: 1 });
passwordResetSchema.index({ studentId: 1, status: 1 });
passwordResetSchema.index({ resetTokenExpiry: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema); 