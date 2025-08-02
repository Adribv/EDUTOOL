const mongoose = require('mongoose');

const staffLeaveRequestSchema = new mongoose.Schema({
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
  department: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Personal Leave', 'Emergency Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Other'],
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
  contactNumber: {
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
      enum: ['Medical Certificate', 'Travel Document', 'Family Function Invitation', 'Other'],
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

module.exports = mongoose.model('StaffLeaveRequest', staffLeaveRequestSchema); 