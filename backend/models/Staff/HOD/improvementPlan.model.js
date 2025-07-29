const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const improvementPlanSchema = new Schema({
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3', 'All Terms'],
    required: true
  },
  subject: {
    type: String
  },
  class: {
    type: String
  },
  section: {
    type: String
  },
  targetAreas: [{
    type: String,
    required: true
  }],
  strategies: [{
    description: {
      type: String,
      required: true
    },
    timeline: {
      type: String
    },
    responsiblePerson: {
      type: Schema.Types.ObjectId,
      ref: 'Staff'
    }
  }],
  resources: [{
    type: String
  }],
  timeline: {
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    milestones: [{
      title: String,
      dueDate: Date,
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  successCriteria: [{
    type: String,
    required: true
  }],
  responsibleTeachers: [{
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  }],
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Completed', 'Archived'],
    default: 'Draft'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Staff'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ImprovementPlan', improvementPlanSchema);