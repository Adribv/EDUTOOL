const mongoose = require('mongoose');

const supplierRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `SR${Date.now().toString(36).toUpperCase()}`
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Stationery', 'Classroom Materials', 'Sports Equipment', 'Lab Supplies', 'Maintenance', 'Furniture', 'Other']
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      required: true
    },
    estimatedPrice: {
      type: Number,
      min: 0
    },
    specifications: String
  }],
  totalEstimatedCost: {
    type: Number,
    required: true,
    min: 0
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'In Progress', 'Completed'],
    default: 'Draft'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approvedAt: Date,
  rejectionReason: String,
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  supplier: {
    name: String,
    contactPerson: String,
    email: String,
    phone: String,
    address: String
  },
  budget: {
    allocated: Number,
    spent: Number,
    remaining: Number
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringSchedule: {
    frequency: {
      type: String,
      enum: ['Weekly', 'Monthly', 'Quarterly', 'Yearly']
    },
    nextRequestDate: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
supplierRequestSchema.index({ status: 1, createdAt: -1 });
supplierRequestSchema.index({ requestedBy: 1, status: 1 });
supplierRequestSchema.index({ category: 1, priority: 1 });
supplierRequestSchema.index({ department: 1 });

// Pre-save middleware to calculate total cost
supplierRequestSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalEstimatedCost = this.items.reduce((total, item) => {
      return total + (item.estimatedPrice || 0) * item.quantity;
    }, 0);
  }
  next();
});

module.exports = mongoose.model('SupplierRequest', supplierRequestSchema); 