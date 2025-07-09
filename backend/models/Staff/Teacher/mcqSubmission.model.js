const mongoose = require('mongoose');

const mcqAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: {
    type: Number, // Index of selected option (0, 1, 2, 3, etc.)
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

const mcqSubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MCQAssignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Submission details
  answers: [mcqAnswerSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  maxPossibleScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  
  // Time tracking
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['In Progress', 'Submitted', 'Graded'],
    default: 'In Progress'
  },
  
  // Review info
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  reviewedAt: {
    type: Date
  },
  teacherComments: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Calculate scores before saving
mcqSubmissionSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.totalScore = this.answers.reduce((sum, answer) => sum + answer.points, 0);
    // Note: maxPossibleScore should be calculated from the assignment, not from answers
    // This will be set when the submission is processed
    this.percentage = this.maxPossibleScore > 0 ? Math.round((this.totalScore / this.maxPossibleScore) * 100) : 0;
  }
  
  if (this.submittedAt && this.startedAt) {
    this.timeTaken = Math.round((this.submittedAt - this.startedAt) / 1000);
  }
  
  next();
});

// Index for better query performance
mcqSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
mcqSubmissionSchema.index({ assignmentId: 1, status: 1 });
mcqSubmissionSchema.index({ studentId: 1, submittedAt: -1 });

module.exports = mongoose.model('MCQSubmission', mcqSubmissionSchema); 