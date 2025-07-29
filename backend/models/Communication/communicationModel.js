const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  recipients: {
    type: [{
      type: String,
      enum: ['All Students', 'All Staff', 'All Parents', 'Specific Class', 'Specific Department', 'Custom']
    }],
    required: true
  },
  recipientDetails: {
    classes: [String],
    departments: [String],
    individuals: [{
      id: mongoose.Schema.Types.ObjectId,
      type: {
        type: String,
        enum: ['Student', 'Staff', 'Parent']
      },
      name: String
    }]
  },
  communicationType: {
    type: String,
    enum: ['Email', 'SMS', 'Notice', 'Circular', 'Announcement', 'Message'],
    required: true
  },
  scheduledDate: {
    type: Date,
    default: Date.now
  },
  sentDate: Date,
  attachments: [{
    name: String,
    path: String,
    type: String
  }],
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sent', 'Failed', 'Deleted'],
    default: 'Draft'
  },
  deliveryStats: {
    total: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Communication', communicationSchema);