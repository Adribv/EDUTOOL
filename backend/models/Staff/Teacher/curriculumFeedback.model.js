const mongoose = require('mongoose');

const curriculumFeedbackSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  feedbackType: {
    type: String,
    enum: ['Content', 'Methodology', 'Assessment', 'Resources', 'Other'],
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  suggestions: {
    type: String
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Implemented', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  reviewComments: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
curriculumFeedbackSchema.index({ teacherId: 1, subject: 1, class: 1, section: 1 });
curriculumFeedbackSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('CurriculumFeedback', curriculumFeedbackSchema); 