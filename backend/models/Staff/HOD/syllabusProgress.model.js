const mongoose = require('mongoose');

const syllabusProgressSchema = new mongoose.Schema({
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
  totalTopics: { 
    type: Number, 
    required: true 
  },
  completedTopics: { 
    type: Number, 
    default: 0 
  },
  completionPercentage: { 
    type: Number, 
    default: 0 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  topics: [{
    name: String,
    status: { 
      type: String, 
      enum: ['Not Started', 'In Progress', 'Completed'], 
      default: 'Not Started' 
    },
    startDate: Date,
    completionDate: Date,
    remarks: String
  }],
  challenges: [String],
  remedialActions: [String],
  status: { 
    type: String, 
    enum: ['On Track', 'Behind Schedule', 'Ahead of Schedule', 'Completed', 'Planned'], 
    default: 'On Track' 
  },
  identifiedIssues: [String],
  proposedSolutions: [String],
  timeline: {
    startDate: Date,
    endDate: Date
  },
  responsibleTeachers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  }
}, { timestamps: true });

module.exports = mongoose.model('SyllabusProgress', syllabusProgressSchema);