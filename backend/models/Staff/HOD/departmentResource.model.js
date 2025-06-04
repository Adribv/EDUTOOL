const mongoose = require('mongoose');

const departmentResourceSchema = new mongoose.Schema({
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  resourceType: { 
    type: String, 
    enum: ['Equipment', 'Book', 'Software', 'Subscription', 'Other'], 
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1 
  },
  status: { 
    type: String, 
    enum: ['Available', 'Limited', 'Unavailable'], 
    default: 'Available' 
  },
  location: String,
  acquisitionDate: Date,
  expiryDate: Date,
  cost: Number,
  attachments: [{
    name: String,
    fileUrl: String,
    uploadDate: { 
      type: Date, 
      default: Date.now 
    }
  }],
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  }
}, { timestamps: true });

module.exports = mongoose.model('DepartmentResource', departmentResourceSchema);