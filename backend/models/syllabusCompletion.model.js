const mongoose = require('mongoose');

const syllabusCompletionSchema = new mongoose.Schema({
  // Basic Information
  class: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  section: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D', 'E', 'F']
  },
  subject: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  
  // Unit/Chapter Details
  unitChapter: {
    type: String,
    required: true
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  plannedCompletionDate: {
    type: Date,
    required: true
  },
  actualCompletionDate: {
    type: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['Not started', 'In Progress', 'Completed', 'Delayed'],
    default: 'Not started'
  },
  
  // Periods
  numberOfPeriodsAllotted: {
    type: Number,
    required: true,
    min: 1
  },
  numberOfPeriodsTaken: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Teaching Method
  teachingMethodUsed: {
    type: String,
    required: true
  },
  
  // Completion Rate
  completionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Remarks
  remarksTopicsLeft: {
    type: String,
    default: ''
  },
  
  // Teacher Remarks
  teacherRemarks: {
    type: String,
    default: ''
  },
  
  // Academic Year
  academicYear: {
    type: String,
    required: true
  },
  
  // Semester/Term
  semester: {
    type: String,
    enum: ['First Term', 'Second Term', 'Third Term', 'Annual'],
    required: true
  },
  
  // Created and Updated by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for better query performance
syllabusCompletionSchema.index({ class: 1, section: 1, subject: 1, academicYear: 1 });
syllabusCompletionSchema.index({ teacherId: 1, academicYear: 1 });
syllabusCompletionSchema.index({ status: 1, academicYear: 1 });

// Pre-save middleware to update completion rate
syllabusCompletionSchema.pre('save', function(next) {
  if (this.numberOfPeriodsAllotted > 0) {
    this.completionRate = Math.round((this.numberOfPeriodsTaken / this.numberOfPeriodsAllotted) * 100);
  }
  
  // Update status based on completion rate and dates
  if (this.completionRate === 100) {
    this.status = 'Completed';
    if (!this.actualCompletionDate) {
      this.actualCompletionDate = new Date();
    }
  } else if (this.completionRate > 0) {
    this.status = 'In Progress';
  } else {
    this.status = 'Not started';
  }
  
  // Check if delayed
  if (this.plannedCompletionDate && new Date() > this.plannedCompletionDate && this.status !== 'Completed') {
    this.status = 'Delayed';
  }
  
  this.updatedAt = new Date();
  next();
});

// Static method to get completion statistics
syllabusCompletionSchema.statics.getCompletionStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPeriodsAllotted: { $sum: '$numberOfPeriodsAllotted' },
        totalPeriodsTaken: { $sum: '$numberOfPeriodsTaken' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Instance method to calculate completion percentage
syllabusCompletionSchema.methods.calculateCompletionPercentage = function() {
  if (this.numberOfPeriodsAllotted === 0) return 0;
  return Math.round((this.numberOfPeriodsTaken / this.numberOfPeriodsAllotted) * 100);
};

module.exports = mongoose.model('SyllabusCompletion', syllabusCompletionSchema); 