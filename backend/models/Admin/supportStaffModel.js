const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: { type: String, enum: ['Cleanliness', 'Safety', 'Logistics', 'Incident'], required: true },
  description: String,
  date: { type: Date, default: Date.now }
});

const supportStaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  assignments: [String],
  logs: [logSchema]
}, { timestamps: true });

module.exports = mongoose.model('SupportStaff', supportStaffSchema); 