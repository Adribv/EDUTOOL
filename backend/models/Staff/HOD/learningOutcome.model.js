const mongoose = require('mongoose');

const learningOutcomeSchema = new mongoose.Schema({
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
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
  academicYear: String,
  term: String,
  topic: { 
    type: String, 
    required: true 
  },
  expectedOutcomes: [String],
  assessmentMethod: { 
    type: String, 
    enum: ['Quiz', 'Test', 'Assignment', 'Project', 'Observation', 'Other'], 
    required: true 
  },
  achievementLevel: { 
    type: String, 
    enum: ['Exceeds Expectations', 'Meets Expectations', 'Partially Meets Expectations', 'Does Not Meet Expectations'], 
    required: true 
  },
  achievementPercentage: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  }
}, { timestamps: true });

module.exports = mongoose.model('LearningOutcome', learningOutcomeSchema);