const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assignment', 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  content: {
    type: String,
    default: ''
  },
  submissionDate: { 
    type: Date, 
    default: Date.now 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  fileUrl: {
    type: String,
    default: ''
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  grade: {
    type: Number,
    min: 0,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Graded', 'Late', 'Returned', 'Resubmitted'], 
    default: 'Submitted' 
  },
  isLate: {
    type: Boolean,
    default: false
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  gradedAt: {
    type: Date
  },
  resubmissionAllowed: {
    type: Boolean,
    default: false
  },
  resubmissionDeadline: {
    type: Date
  },
  version: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Ensure a student can only have one submission per assignment (latest version)
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);