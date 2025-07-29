const mongoose = require('mongoose');

const teacherEvaluationSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  evaluatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
  academicYear: String,
  term: String,
  date: { 
    type: Date, 
    default: Date.now 
  },
  categories: [{
    name: { 
      type: String, 
      enum: [
        'Teaching Methodology', 
        'Classroom Management', 
        'Student Engagement', 
        'Content Knowledge', 
        'Assessment Techniques', 
        'Professional Conduct'
      ] 
    },
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    comments: String
  }],
  strengths: [String],
  areasForImprovement: [String],
  recommendedTraining: [String],
  overallRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  overallComments: String,
  status: { 
    type: String, 
    enum: ['Draft', 'Completed', 'Shared'], 
    default: 'Draft' 
  },
  acknowledgement: {
    acknowledged: { 
      type: Boolean, 
      default: false 
    },
    date: Date,
    comments: String
  }
}, { timestamps: true });

module.exports = mongoose.model('TeacherEvaluation', teacherEvaluationSchema);