const mongoose = require('mongoose');

const substitutionSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  substituteTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  date: Date,
  periodNumber: Number,
  class: String,
  section: String,
  subject: String,
  reason: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('Substitution', substitutionSchema);