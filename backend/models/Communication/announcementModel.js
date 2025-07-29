const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['All Students', 'All Staff', 'All Parents', 'Specific Class'],
    required: true
  },
  targetClass: {
    type: String,
    required: function() {
      return this.targetAudience === 'Specific Class';
    }
  },
  targetSection: {
    type: String,
    default: 'All'
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  acknowledgementRequired: {
    type: Boolean,
    default: false
  },
  acknowledgements: [{
    userId: mongoose.Schema.Types.ObjectId,
    userType: {
      type: String,
      enum: ['Student', 'Staff', 'Parent']
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);