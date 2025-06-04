// Add models/assignment.model.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  class: String,
  section: String,
  subject: String,
  dueDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);