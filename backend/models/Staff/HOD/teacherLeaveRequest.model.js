const mongoose = require('mongoose');

const teacherLeaveRequestSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  leaveType: { 
    type: String, 
    enum: ['Sick', 'Casual', 'Maternity', 'Paternity', 'Study', 'Other'], 
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
  supportingDocuments: [{
    documentName: {
      type: String,
      required: true
    },
    documentType: {
      type: String,
      enum: ['Medical Certificate', 'Travel Document', 'Family Function Invitation', 'Study Leave Document', 'Other'],
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
  // Keep for backward compatibility
  attachmentUrl: String,
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], 
    default: 'Pending' 
  },
  hodComments: String,
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  },
  processedAt: Date,
  adminApproval: {
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'] 
    },
    comments: String,
    processedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Staff' 
    },
    processedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('TeacherLeaveRequest', teacherLeaveRequestSchema);