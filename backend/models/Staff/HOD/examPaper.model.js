const mongoose = require('mongoose');

const examPaperSchema = new mongoose.Schema({
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
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
  section: String,
  examType: { 
    type: String, 
    enum: ['Unit Test', 'Mid-Term', 'Final', 'Quiz', 'Practice', 'Other'], 
    required: true 
  },
  examDate: Date,
  duration: { 
    type: Number, 
    required: true 
  }, // in minutes
  totalMarks: { 
    type: Number, 
    required: true 
  },
  passingMarks: { 
    type: Number, 
    required: true 
  },
  instructions: [String],
  sections: [{
    title: String,
    description: String,
    marks: Number,
    questions: [{
      questionType: { 
        type: String, 
        enum: ['Multiple Choice', 'True/False', 'Short Answer', 'Long Answer', 'Fill in the Blanks', 'Matching'], 
        required: true 
      },
      questionText: { 
        type: String, 
        required: true 
      },
      options: [String], // For multiple choice
      correctAnswer: String,
      marks: { 
        type: Number, 
        required: true 
      },
      difficulty: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard'], 
        default: 'Medium' 
      }
    }]
  }],
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Published'], 
    default: 'Draft' 
  },
  moderationFeedback: String,
  suggestedChanges: [String],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  moderatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  },
  moderatedAt: Date,
  attachmentUrl: String
}, { timestamps: true });

module.exports = mongoose.model('ExamPaper', examPaperSchema);