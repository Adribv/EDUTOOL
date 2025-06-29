// Add models/assignment.model.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    default: 100,
    min: 1
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Completed', 'Archived'],
    default: 'Active'
  },
  submissionType: {
    type: String,
    enum: ['Text', 'File', 'Both'],
    default: 'Both'
  },
  allowLateSubmission: {
    type: Boolean,
    default: true
  },
  gradingRubric: {
    type: String,
    default: ''
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff',
    required: true
  }
}, { timestamps: true });

// Index for better query performance
assignmentSchema.index({ class: 1, section: 1, subject: 1 });
assignmentSchema.index({ createdBy: 1, createdAt: -1 });
assignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);