const mongoose = require('mongoose');

const budgetItemSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: true
  },
  budgetCategory: {
    type: String,
    required: true,
    enum: ['Salaries', 'Academic Materials', 'Infrastructure', 'Technology', 'Utilities & Maintenance', 'Events & Activities', 'Miscellaneous']
  },
  description: {
    type: String,
    required: true
  },
  proposedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  approvedAmount: {
    type: Number,
    required: false,
    min: 0
  },
  remarks: {
    type: String,
    required: false
  }
});

const budgetApprovalSchema = new mongoose.Schema({
  // Header Information
  schoolName: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  preparedBy: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  dateOfSubmission: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Budget Items
  budgetItems: [budgetItemSchema],

  // Totals
  totalProposedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalApprovedAmount: {
    type: Number,
    required: false,
    min: 0
  },

  // Approval Information
  approvalStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved as Presented', 'Approved with Revisions', 'Rejected'],
    default: 'Pending'
  },
  approvalType: {
    type: String,
    required: false,
    enum: ['Approved as presented', 'Approve with the following revisions']
  },
  principalName: {
    type: String,
    required: false
  },
  principalSignature: {
    type: String,
    required: false
  },
  approvalDate: {
    type: Date,
    required: false
  },
  approvalRemarks: {
    type: String,
    required: false
  },

  // File Attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },

  // Status tracking
  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Archived'],
    default: 'Draft'
  },

  // Additional fields
  fiscalYear: {
    type: String,
    required: false
  },
  budgetType: {
    type: String,
    required: true,
    enum: ['Annual', 'Quarterly', 'Monthly', 'Special Project'],
    default: 'Annual'
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
budgetApprovalSchema.index({ academicYear: 1 });
budgetApprovalSchema.index({ status: 1 });
budgetApprovalSchema.index({ createdBy: 1 });
budgetApprovalSchema.index({ approvedBy: 1 });
budgetApprovalSchema.index({ dateOfSubmission: -1 });
budgetApprovalSchema.index({ approvalStatus: 1 });

// Pre-save middleware to calculate totals
budgetApprovalSchema.pre('save', function(next) {
  if (this.budgetItems && this.budgetItems.length > 0) {
    this.totalProposedAmount = this.budgetItems.reduce((sum, item) => sum + (item.proposedAmount || 0), 0);
    
    const approvedItems = this.budgetItems.filter(item => item.approvedAmount !== undefined && item.approvedAmount !== null);
    if (approvedItems.length > 0) {
      this.totalApprovedAmount = approvedItems.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);
    }
  }
  next();
});

module.exports = mongoose.model('BudgetApproval', budgetApprovalSchema); 