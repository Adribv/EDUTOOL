const mongoose = require('mongoose');

const itSupportRequestSchema = new mongoose.Schema({
  // Request Details
  requestNumber: {
    type: String,
    unique: true
  },
  dateOfRequest: {
    type: Date,
    default: Date.now
  },
  
  // Requester Information
  requesterInfo: {
    name: {
      type: String,
      required: true
    },
    designationRole: {
      type: String,
      required: true
    },
    departmentClass: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    emailAddress: {
      type: String,
      required: true
    }
  },
  
  // Device/Equipment Information
  deviceEquipmentInfo: {
    typeOfDevice: {
      type: String,
      enum: ['Desktop', 'Laptop', 'Projector', 'Printer', 'Smart Board', 'Network Issue', 'Software/Application', 'Other'],
      required: true
    },
    deviceAssetId: {
      type: String,
      default: ''
    },
    operatingSystem: {
      type: String,
      default: ''
    },
    otherDeviceType: {
      type: String,
      default: ''
    }
  },
  
  // Issue Description
  issueDescription: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Priority Level
  priorityLevel: {
    type: String,
    enum: ['Low - Minor inconvenience', 'Medium - Work impacted, workaround possible', 'High - Work halted, needs urgent resolution'],
    required: true
  },
  
  // Requested Action
  requestedAction: {
    type: String,
    enum: ['Troubleshoot & Fix', 'Replace Device/Part', 'Software Installation/Update', 'Network Configuration', 'Other'],
    required: true
  },
  
  // Preferred Contact Time
  preferredContactTime: {
    type: String,
    default: ''
  },
  
  // Acknowledgment
  acknowledgment: {
    confirmed: {
      type: Boolean,
      required: true,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  
  // Requester signature (digital confirmation)
  requesterSignature: {
    type: String,
    required: true
  },
  
  // For IT Department Use Only
  itDepartmentUse: {
    requestReceivedBy: {
      type: String,
      default: ''
    },
    dateTimeReceived: {
      type: Date,
      default: null
    },
    initialResponseTime: {
      type: Date,
      default: null
    },
    resolutionDate: {
      type: Date,
      default: null
    },
    actionTaken: {
      type: String,
      default: ''
    },
    technicianNameSignature: {
      type: String,
      default: ''
    }
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['Submitted', 'Received', 'In Progress', 'Resolved', 'Closed'],
    default: 'Submitted'
  },
  
  // Student/Staff reference
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'requesterType'
  },
  requesterType: {
    type: String,
    required: true,
    enum: ['Student', 'Staff']
  },
  
  // Created and updated timestamps
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

// Pre-save middleware to generate request number
itSupportRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.requestNumber = `ITS-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for better query performance
itSupportRequestSchema.index({ requestNumber: 1 });
itSupportRequestSchema.index({ requesterId: 1, requesterType: 1 });
itSupportRequestSchema.index({ status: 1 });
itSupportRequestSchema.index({ dateOfRequest: -1 });

const ITSupportRequest = mongoose.model('ITSupportRequest', itSupportRequestSchema);

module.exports = ITSupportRequest; 