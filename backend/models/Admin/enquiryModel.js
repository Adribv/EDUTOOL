const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  enquiryNumber: {
    type: String,
    unique: true,
    default: () => `ENQ${Date.now().toString(36).toUpperCase()}`
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  message: { type: String, required: true },
  reply: String,
  status: { type: String, enum: ['Pending', 'Replied', 'Closed', 'New', 'In Progress', 'Resolved'], default: 'Pending' },
  enquiryType: { type: String, default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  source: { type: String, default: 'Website' },
  tags: { type: [String], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema); 