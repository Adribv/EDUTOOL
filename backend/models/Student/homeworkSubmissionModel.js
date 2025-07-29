const mongoose = require('mongoose');

const homeworkSubmissionSchema = new mongoose.Schema({
  homeworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  content: {
    type: String
  },
  fileUrl: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Submitted', 'Graded', 'Returned'],
    default: 'Submitted'
  },
  grade: {
    score: Number,
    outOf: Number,
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    gradedAt: Date
  },
  isLate: {
    type: Boolean,
    default: false
  },
  remarks: String
}, { timestamps: true });

// Ensure a student can only have one submission per homework
homeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);