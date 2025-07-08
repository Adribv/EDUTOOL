const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  enquiryNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `ENQ${Date.now().toString(36).toUpperCase()}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  enquiryType: {
    type: String,
    enum: ['Admission', 'General', 'Academic', 'Financial', 'Technical', 'Other'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Resolved', 'Closed'],
    default: 'New'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  source: {
    type: String,
    enum: ['Website', 'Phone', 'Email', 'Walk-in', 'Social Media', 'Referral'],
    default: 'Website'
  },
  followUpDate: {
    type: Date
  },
  resolvedDate: {
    type: Date
  },
  resolution: {
    type: String,
    trim: true
  },
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ assignedTo: 1, status: 1 });
enquirySchema.index({ enquiryType: 1, priority: 1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ phone: 1 });

// Pre-save middleware to auto-assign if not assigned
enquirySchema.pre('save', function(next) {
  if (this.isNew && !this.assignedTo) {
    // Auto-assign to admin staff if available
    // This can be enhanced with more sophisticated assignment logic
    this.assignedTo = null; // Will be assigned by admin
  }
  next();
});

module.exports = mongoose.model('Enquiry', enquirySchema); 