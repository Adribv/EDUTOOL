const mongoose = require('mongoose');

const substituteRequestSchema = new mongoose.Schema({
  // Request Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Requester Information (Teacher requesting substitute)
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  requesterName: {
    type: String,
    required: true,
    trim: true
  },
  requesterDepartment: {
    type: String,
    required: true,
    trim: true
  },
  
  // Substitute Information (Teacher being requested as substitute)
  substituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  substituteName: {
    type: String,
    required: true,
    trim: true
  },
  substituteDepartment: {
    type: String,
    required: true,
    trim: true
  },
  
  // Request Details
  requestType: {
    type: String,
    enum: ['Class Coverage', 'Duty Coverage', 'Meeting Coverage', 'Event Coverage', 'Other'],
    required: true
  },
  reason: {
    type: String,
    enum: ['Leave', 'Training', 'Conference', 'Medical', 'Personal', 'Emergency', 'Other'],
    required: true
  },
  detailedReason: {
    type: String,
    required: true,
    trim: true
  },
  
  // Coverage Details
  coverageDetails: {
    classes: [{
      subject: String,
      class: String,
      section: String,
      date: Date,
      timeSlot: String,
      duration: Number // in minutes
    }],
    duties: [{
      dutyType: String,
      date: Date,
      timeSlot: String,
      location: String
    }],
    meetings: [{
      meetingType: String,
      date: Date,
      timeSlot: String,
      location: String
    }],
    events: [{
      eventName: String,
      date: Date,
      timeSlot: String,
      location: String
    }]
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  
  // Additional Information
  specialInstructions: {
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
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Active', 'Completed', 'Cancelled'],
    default: 'Draft'
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
  
  // Substitute Response
  substituteResponse: {
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined'],
      default: 'Pending'
    },
    responseDate: Date,
    comments: String
  },
  
  // Supporting Documents
  supportingDocuments: [{
    filename: String,
    originalName: String,
    path: String,
    documentType: {
      type: String,
      enum: ['Leave Application', 'Medical Certificate', 'Travel Document', 'Other'],
      required: true
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  }],
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['Created', 'Submitted', 'Approved', 'Rejected', 'Accepted', 'Declined', 'Completed']
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
      enum: ['Created', 'Updated', 'Submitted', 'Approved', 'Rejected', 'Accepted', 'Declined', 'Completed', 'Cancelled']
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
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
substituteRequestSchema.index({ requesterId: 1, status: 1 });
substituteRequestSchema.index({ substituteId: 1, status: 1 });
substituteRequestSchema.index({ status: 1, startDate: 1 });
substituteRequestSchema.index({ createdAt: -1 });
substituteRequestSchema.index({ 'notifications.recipientId': 1, 'notifications.read': 1 });

// Pre-save middleware to update version and history
substituteRequestSchema.pre('save', function(next) {
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
                this.status === 'Active' ? 'Active' : 
                this.status === 'Completed' ? 'Completed' : 
                this.status === 'Cancelled' ? 'Cancelled' : 'Updated',
        performedBy: this.updatedBy || this.createdBy,
        performedAt: new Date(),
        previousStatus,
        newStatus: this.status
      });
    }
  }
  next();
});

// Virtual for checking if request is active
substituteRequestSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'Active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Virtual for checking if request is completed
substituteRequestSchema.virtual('isCompleted').get(function() {
  const now = new Date();
  return this.status === 'Completed' || 
         (this.status === 'Active' && this.endDate < now);
});

// Static method to get active substitute requests
substituteRequestSchema.statics.getActiveRequests = function() {
  const now = new Date();
  return this.find({
    status: 'Active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).populate('requesterId', 'name email department')
    .populate('substituteId', 'name email department');
};

// Static method to get pending approvals
substituteRequestSchema.statics.getPendingApprovals = function() {
  return this.find({ status: 'Pending' })
    .populate('requesterId', 'name email department')
    .populate('substituteId', 'name email department')
    .sort({ createdAt: -1 });
};

// Static method to get substitute requests by staff member
substituteRequestSchema.statics.getRequestsByStaff = function(staffId, role = 'both') {
  let query = {};
  
  if (role === 'requester') {
    query.requesterId = staffId;
  } else if (role === 'substitute') {
    query.substituteId = staffId;
  } else {
    query.$or = [{ requesterId: staffId }, { substituteId: staffId }];
  }
  
  return this.find(query)
    .populate('requesterId', 'name email department')
    .populate('substituteId', 'name email department')
    .sort({ createdAt: -1 });
};

// Instance method to approve substitute request
substituteRequestSchema.methods.approve = function(approvedBy, comments = '') {
  this.status = 'Active';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.approvalComments = comments;
  
  // Add notification
  this.notifications.push({
    type: 'Approved',
    recipientId: this.requesterId,
    message: `Your substitute request "${this.title}" has been approved.`,
    sentAt: new Date()
  });
  
  return this.save();
};

// Instance method to reject substitute request
substituteRequestSchema.methods.reject = function(rejectedBy, comments = '') {
  this.status = 'Rejected';
  this.rejectedBy = rejectedBy;
  this.rejectedAt = new Date();
  this.rejectionComments = comments;
  
  // Add notification
  this.notifications.push({
    type: 'Rejected',
    recipientId: this.requesterId,
    message: `Your substitute request "${this.title}" has been rejected.`,
    sentAt: new Date()
  });
  
  return this.save();
};

// Instance method for substitute to accept request
substituteRequestSchema.methods.accept = function(comments = '') {
  this.substituteResponse.status = 'Accepted';
  this.substituteResponse.responseDate = new Date();
  this.substituteResponse.comments = comments;
  
  // Add notification
  this.notifications.push({
    type: 'Accepted',
    recipientId: this.requesterId,
    message: `Your substitute request "${this.title}" has been accepted.`,
    sentAt: new Date()
  });
  
  return this.save();
};

// Instance method for substitute to decline request
substituteRequestSchema.methods.decline = function(comments = '') {
  this.substituteResponse.status = 'Declined';
  this.substituteResponse.responseDate = new Date();
  this.substituteResponse.comments = comments;
  
  // Add notification
  this.notifications.push({
    type: 'Declined',
    recipientId: this.requesterId,
    message: `Your substitute request "${this.title}" has been declined.`,
    sentAt: new Date()
  });
  
  return this.save();
};

// Instance method to check if request can be approved
substituteRequestSchema.methods.canBeApproved = function() {
  return this.status === 'Pending';
};

// Instance method to check if request can be rejected
substituteRequestSchema.methods.canBeRejected = function() {
  return this.status === 'Pending';
};

// Instance method to get request summary
substituteRequestSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    requester: this.requesterName,
    substitute: this.substituteName,
    type: this.requestType,
    status: this.status,
    startDate: this.startDate,
    endDate: this.endDate,
    isActive: this.isActive,
    isCompleted: this.isCompleted
  };
};

module.exports = mongoose.model('SubstituteRequest', substituteRequestSchema); 