const mongoose = require('mongoose');

const teacherRemarksSchema = new mongoose.Schema({
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
    required: false
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
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
  
  // Lesson Progress Tracking
  lessonsCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  lessonsPending: {
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
  
  // Completion Ratio (decimal form, e.g., 0.75 for 75%)
  completionRatio: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  
  // Remarks
  remarksTopicsLeft: {
    type: String,
    default: ''
  },
  
  // Teacher Remarks (Enhanced)
  teacherRemarks: {
    type: String,
    default: ''
  },
  
  // Additional Teacher Remarks Fields
  studentPerformance: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'],
    default: 'Average'
  },
  
  classParticipation: {
    type: String,
    enum: ['Very Active', 'Active', 'Moderate', 'Low', 'Very Low'],
    default: 'Moderate'
  },
  
  homeworkCompletion: {
    type: String,
    enum: ['Always Complete', 'Usually Complete', 'Sometimes Complete', 'Rarely Complete', 'Never Complete'],
    default: 'Sometimes Complete'
  },
  
  understandingLevel: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'],
    default: 'Average'
  },
  
  areasOfConcern: {
    type: String,
    default: ''
  },
  
  suggestionsForImprovement: {
    type: String,
    default: ''
  },
  
  parentCommunication: {
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
  
  // Form Status
  formStatus: {
    type: String,
    enum: ['Draft', 'Submitted', 'Reviewed', 'Approved'],
    default: 'Draft'
  },
  
  // Created and Updated by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
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
teacherRemarksSchema.index({ class: 1, section: 1, subject: 1, academicYear: 1 });
teacherRemarksSchema.index({ teacherId: 1, academicYear: 1 });
teacherRemarksSchema.index({ status: 1, academicYear: 1 });
teacherRemarksSchema.index({ formStatus: 1, academicYear: 1 });

// Pre-save middleware to update completion rate
teacherRemarksSchema.pre('save', function(next) {
  // Calculate completion rate and ratio based on lessons completed and pending
  const totalLessons = (this.lessonsCompleted || 0) + (this.lessonsPending || 0);
  if (totalLessons > 0) {
    this.completionRate = Math.round(((this.lessonsCompleted || 0) / totalLessons) * 100);
    this.completionRatio = (this.lessonsCompleted || 0) / totalLessons;
  } else if (this.numberOfPeriodsAllotted > 0) {
    // Fallback to periods-based calculation if lessons not provided
    this.completionRate = Math.round((this.numberOfPeriodsTaken / this.numberOfPeriodsAllotted) * 100);
    this.completionRatio = this.numberOfPeriodsTaken / this.numberOfPeriodsAllotted;
  } else {
    this.completionRate = 0;
    this.completionRatio = 0;
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

// Pre-update middleware to handle completion rate calculation for findByIdAndUpdate
teacherRemarksSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // If lessonsCompleted or lessonsPending are being updated, recalculate completion rate
  if (update.lessonsCompleted !== undefined || update.lessonsPending !== undefined) {
    const lessonsCompleted = update.lessonsCompleted || 0;
    const lessonsPending = update.lessonsPending || 0;
    const totalLessons = lessonsCompleted + lessonsPending;
    
    if (totalLessons > 0) {
      update.completionRate = Math.round((lessonsCompleted / totalLessons) * 100);
      update.completionRatio = lessonsCompleted / totalLessons;
    } else {
      update.completionRate = 0;
      update.completionRatio = 0;
    }
    
    // Update status based on completion rate
    if (update.completionRate === 100) {
      update.status = 'Completed';
      if (!update.actualCompletionDate) {
        update.actualCompletionDate = new Date();
      }
    } else if (update.completionRate > 0) {
      update.status = 'In Progress';
    } else {
      update.status = 'Not started';
    }
  }
  
  update.updatedAt = new Date();
  next();
});

// Static method to get remarks statistics
teacherRemarksSchema.statics.getRemarksStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$formStatus',
        count: { $sum: 1 },
        totalPeriodsAllotted: { $sum: '$numberOfPeriodsAllotted' },
        totalPeriodsTaken: { $sum: '$numberOfPeriodsTaken' },
        totalLessonsCompleted: { $sum: '$lessonsCompleted' },
        totalLessonsPending: { $sum: '$lessonsPending' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Instance method to calculate completion percentage
teacherRemarksSchema.methods.calculateCompletionPercentage = function() {
  const totalLessons = (this.lessonsCompleted || 0) + (this.lessonsPending || 0);
  if (totalLessons > 0) {
    return Math.round(((this.lessonsCompleted || 0) / totalLessons) * 100);
  }
  if (this.numberOfPeriodsAllotted === 0) return 0;
  return Math.round((this.numberOfPeriodsTaken / this.numberOfPeriodsAllotted) * 100);
};

module.exports = mongoose.model('TeacherRemarks', teacherRemarksSchema); 