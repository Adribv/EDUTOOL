const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYear: {
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
  
  // Academic Performance
  academicPerformance: {
    overallGrade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
      required: true
    },
    overallPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    subjects: [{
      name: {
        type: String,
        required: true
      },
      grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
      },
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      marks: {
        type: Number,
        min: 0
      },
      totalMarks: {
        type: Number,
        min: 0
      },
      teacherRemarks: String,
      improvement: {
        type: String,
        enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
      }
    }],
    rank: Number,
    totalStudents: Number
  },

  // Attendance Tracking
  attendance: {
    totalDays: {
      type: Number,
      required: true
    },
    daysPresent: {
      type: Number,
      required: true
    },
    daysAbsent: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    lateArrivals: {
      type: Number,
      default: 0
    },
    earlyDepartures: {
      type: Number,
      default: 0
    }
  },

  // Behavioral Assessment
  behavior: {
    overallRating: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor'],
      required: true
    },
    punctuality: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    discipline: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    participation: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    teamwork: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    leadership: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    remarks: String
  },

  // Co-curricular Activities
  coCurricular: {
    sports: {
      participated: {
        type: Boolean,
        default: false
      },
      achievements: [String],
      rating: {
        type: String,
        enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
      }
    },
    cultural: {
      participated: {
        type: Boolean,
        default: false
      },
      achievements: [String],
      rating: {
        type: String,
        enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
      }
    },
    academic: {
      participated: {
        type: Boolean,
        default: false
      },
      achievements: [String],
      rating: {
        type: String,
        enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
      }
    }
  },

  // Skills Assessment
  skills: {
    communication: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    problemSolving: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    creativity: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    criticalThinking: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    digitalLiteracy: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    }
  },

  // Goals and Targets
  goals: {
    academic: {
      currentTarget: String,
      achieved: Boolean,
      remarks: String
    },
    behavioral: {
      currentTarget: String,
      achieved: Boolean,
      remarks: String
    },
    personal: {
      currentTarget: String,
      achieved: Boolean,
      remarks: String
    }
  },

  // Progress Trends
  trends: {
    academicProgress: {
      type: String,
      enum: ['Improving', 'Stable', 'Declining'],
      required: true
    },
    attendanceTrend: {
      type: String,
      enum: ['Improving', 'Stable', 'Declining'],
      required: true
    },
    behaviorTrend: {
      type: String,
      enum: ['Improving', 'Stable', 'Declining'],
      required: true
    }
  },

  // Recommendations
  recommendations: {
    academic: [String],
    behavioral: [String],
    coCurricular: [String],
    general: [String]
  },

  // Assessment Period
  assessmentPeriod: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'],
    required: true
  },
  
  // Report Generation
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  generatedDate: {
    type: Date,
    default: Date.now
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },

  // Additional Notes
  notes: String,
  
  // Parent/Student Feedback
  feedback: {
    parentComments: String,
    studentComments: String,
    acknowledgmentDate: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
studentProgressSchema.index({ studentId: 1, academicYear: 1, assessmentPeriod: 1 });
studentProgressSchema.index({ class: 1, section: 1 });
studentProgressSchema.index({ 'academicPerformance.overallGrade': 1 });
studentProgressSchema.index({ 'attendance.percentage': 1 });
studentProgressSchema.index({ status: 1 });

// Note: attendance.percentage is calculated in pre-save middleware

// Pre-save middleware to calculate attendance
studentProgressSchema.pre('save', function(next) {
  if (this.attendance.totalDays && this.attendance.daysPresent) {
    this.attendance.percentage = Math.round((this.attendance.daysPresent / this.attendance.totalDays) * 100);
  }
  next();
});

module.exports = mongoose.model('StudentProgress', studentProgressSchema); 