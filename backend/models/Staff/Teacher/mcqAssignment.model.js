const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  explanation: {
    type: String,
    default: ''
  }
});

const mcqAssignmentSchema = new mongoose.Schema({
  // Basic assignment info
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
  
  // MCQ specific fields
  questions: [mcqQuestionSchema],
  totalQuestions: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number, // in minutes, 0 means no time limit
    default: 0,
    min: 0
  },
  allowReview: {
    type: Boolean,
    default: true
  },
  showResults: {
    type: Boolean,
    default: true
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  },
  
  // Assignment status
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Completed', 'Archived'],
    default: 'Draft'
  },
  
  // Creator info
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff',
    required: true
  }
}, { timestamps: true });

// Calculate total questions before saving
mcqAssignmentSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  next();
});

// Index for better query performance
mcqAssignmentSchema.index({ class: 1, section: 1, subject: 1 });
mcqAssignmentSchema.index({ createdBy: 1, createdAt: -1 });
mcqAssignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model('MCQAssignment', mcqAssignmentSchema); 