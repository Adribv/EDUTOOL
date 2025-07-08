const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  message: { type: String, required: true },
  reply: String,
  status: { type: String, enum: ['Pending', 'Replied', 'Closed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema); 