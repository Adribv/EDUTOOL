const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  resourceType: { 
    type: String, 
    enum: ['Teaching Material', 'Equipment', 'Software', 'Books', 'Activity Permission', 'Other'],
    required: true
  },
  purpose: { type: String, required: true },
  targetDate: Date,
  estimatedCost: Number,
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'],
    default: 'Pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  approvalDate: Date,
  comments: String
}, { timestamps: true });

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);