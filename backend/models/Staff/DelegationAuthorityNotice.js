const mongoose = require('mongoose');

const delegationAuthorityNoticeSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Delegator Information (Person delegating authority)
  delegatorName: {
    type: String,
    required: true,
    trim: true
  },
  delegatorPosition: {
    type: String,
    required: true,
    trim: true
  },
  delegatorDepartment: {
    type: String,
    required: true,
    trim: true
  },
  delegatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  
  // Delegate Information (Person receiving authority)
  delegateName: {
    type: String,
    required: true,
    trim: true
  },
  delegatePosition: {
    type: String,
    required: true,
    trim: true
  },
  delegateDepartment: {
    type: String,
    required: true,
    trim: true
  },
  delegateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  
  // Delegation Details
  delegationType: {
    type: String,
    enum: ['Temporary', 'Permanent', 'Emergency', 'Project-based'],
    required: true
  },
  authorityScope: {
    type: String,
    required: true,
    trim: true
  },
  responsibilities: {
    type: String,
    required: true,
    trim: true
  },
  limitations: {
    type: String,
    trim: true
  },
  
  // Dates
  effectiveDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  
  // Additional Information
  conditions: {
    type: String,
    trim: true
  },
  reportingStructure: {
    type: String,
    trim: true
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  
  // Approval Workflow
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Active', 'Expired', 'Revoked'],
    default: 'Draft'
  },
  approvalRequired: {
    type: Boolean,
    default: true
  },
  
  // Approval Details
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approvedAt: {
    type: Date
  },
  approvalComments: {
    type: String,
    trim: true
  },
  
  // Rejection Details
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  rejectedAt: {
    type: Date
  },
  rejectionComments: {
    type: String,
    trim: true
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['Created', 'Submitted', 'Approved', 'Rejected', 'Expired', 'Revoked']
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  
  // History
  history: [{
    action: {
      type: String,
      enum: ['Created', 'Updated', 'Submitted', 'Approved', 'Rejected', 'Expired', 'Revoked']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    comments: String,
    previousStatus: String,
    newStatus: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
delegationAuthorityNoticeSchema.index({ delegatorId: 1, status: 1 });
delegationAuthorityNoticeSchema.index({ delegateId: 1, status: 1 });
delegationAuthorityNoticeSchema.index({ status: 1, effectiveDate: 1 });
delegationAuthorityNoticeSchema.index({ createdAt: -1 });
delegationAuthorityNoticeSchema.index({ 'notifications.recipientId': 1, 'notifications.read': 1 });

// Pre-save middleware to update version and history
delegationAuthorityNoticeSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
    
    // Add to history if status changed
    if (this.isModified('status')) {
      const previousStatus = this._original?.status || 'New';
      this.history.push({
        action: this.status === 'Draft' ? 'Created' : 
                this.status === 'Pending' ? 'Submitted' : 
                this.status === 'Approved' ? 'Approved' : 
                this.status === 'Rejected' ? 'Rejected' : 
                this.status === 'Expired' ? 'Expired' : 
                this.status === 'Revoked' ? 'Revoked' : 'Updated',
        performedBy: this.updatedBy || this.createdBy,
        performedAt: new Date(),
        previousStatus,
        newStatus: this.status
      });
    }
  }
  next();
});

// Virtual for checking if delegation is active
delegationAuthorityNoticeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'Active' && 
         this.effectiveDate <= now && 
         (!this.expiryDate || this.expiryDate > now);
});

// Virtual for checking if delegation is expired
delegationAuthorityNoticeSchema.virtual('isExpired').get(function() {
  const now = new Date();
  return this.expiryDate && this.expiryDate <= now;
});

// Static method to get active delegations
delegationAuthorityNoticeSchema.statics.getActiveDelegations = function() {
  const now = new Date();
  return this.find({
    status: 'Active',
    effectiveDate: { $lte: now },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: now } }
    ]
  }).populate('delegatorId', 'name email').populate('delegateId', 'name email');
};

// Static method to get pending approvals
delegationAuthorityNoticeSchema.statics.getPendingApprovals = function() {
  return this.find({ status: 'Pending' })
    .populate('delegatorId', 'name email position department')
    .populate('delegateId', 'name email position department')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get delegations by staff member
delegationAuthorityNoticeSchema.statics.getDelegationsByStaff = function(staffId, role = 'both') {
  let query = {};
  
  if (role === 'delegator') {
    query.delegatorId = staffId;
  } else if (role === 'delegate') {
    query.delegateId = staffId;
  } else {
    query.$or = [{ delegatorId: staffId }, { delegateId: staffId }];
  }
  
  return this.find(query)
    .populate('delegatorId', 'name email position department')
    .populate('delegateId', 'name email position department')
    .sort({ createdAt: -1 });
};

// Instance method to approve delegation
delegationAuthorityNoticeSchema.methods.approve = function(approvedBy, comments = '') {
  this.status = 'Active';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.approvalComments = comments;
  
  // Add notification
  this.notifications.push({
    type: 'Approved',
    recipientId: this.createdBy,
    message: `Your delegation authority notice "${this.title}" has been approved.`,
    sentAt: new Date()
  });
  
  return this.save();
};

// Instance method to reject delegation
delegationAuthorityNoticeSchema.methods.reject = function(rejectedBy, comments = '') {
  this.status = 'Rejected';
  this.rejectedBy = rejectedBy;
  this.rejectedAt = new Date();
  this.rejectionComments = comments;
  
  // Add notification
  this.notifications.push({
    type: 'Rejected',
    recipientId: this.createdBy,
    message: `Your delegation authority notice "${this.title}" has been rejected.`,
    sentAt: new Date()
  });
  
  return this.save();
};

// Instance method to revoke delegation
delegationAuthorityNoticeSchema.methods.revoke = function(revokedBy, comments = '') {
  this.status = 'Revoked';
  
  // Add to history
  this.history.push({
    action: 'Revoked',
    performedBy: revokedBy,
    performedAt: new Date(),
    comments,
    previousStatus: this.status,
    newStatus: 'Revoked'
  });
  
  // Add notification
  this.notifications.push({
    type: 'Revoked',
    recipientId: this.delegateId,
    message: `Your delegation authority for "${this.title}" has been revoked.`,
    sentAt: new Date()
  });
  
  return this.save();
};

// Instance method to check if delegation can be approved
delegationAuthorityNoticeSchema.methods.canBeApproved = function() {
  return this.status === 'Pending';
};

// Instance method to check if delegation can be rejected
delegationAuthorityNoticeSchema.methods.canBeRejected = function() {
  return this.status === 'Pending';
};

// Instance method to check if delegation can be revoked
delegationAuthorityNoticeSchema.methods.canBeRevoked = function() {
  return this.status === 'Active';
};

// Instance method to get delegation summary
delegationAuthorityNoticeSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    delegator: this.delegatorName,
    delegate: this.delegateName,
    type: this.delegationType,
    status: this.status,
    effectiveDate: this.effectiveDate,
    expiryDate: this.expiryDate,
    isActive: this.isActive,
    isExpired: this.isExpired
  };
};

module.exports = mongoose.model('DelegationAuthorityNotice', delegationAuthorityNoticeSchema); 