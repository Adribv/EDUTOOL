const mongoose = require('mongoose');

const studentLeaveRequestSchema = new mongoose.Schema({
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
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Personal Leave', 'Emergency Leave', 'Family Function', 'Medical Appointment', 'Other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  parentContact: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approvedAt: Date,
  comments: String,
  supportingDocuments: [{
    documentName: {
      type: String,
      required: true
    },
    documentType: {
      type: String,
      enum: ['Medical Certificate', 'Travel Document', 'Family Function Invitation', 'School Event', 'Other'],
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentLeaveRequest', studentLeaveRequestSchema); 