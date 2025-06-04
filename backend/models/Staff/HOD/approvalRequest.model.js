const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const approvalHistorySchema = new Schema({
  approver: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Approved', 'Rejected', 'Forwarded to VP']
  },
  comments: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const approvalRequestSchema = new Schema({
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  requestType: {
    type: String,
    required: true,
    enum: ['Leave', 'Resource', 'Event', 'Budget', 'Other']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected', 'Forwarded'],
    default: 'Pending'
  },
  currentApprover: {
    type: String,
    required: true,
    enum: ['HOD', 'VP', 'Principal', 'Completed'],
    default: 'HOD'
  },
  approvalHistory: [approvalHistorySchema],
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);