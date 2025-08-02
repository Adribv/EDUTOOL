const mongoose = require('mongoose');

const comprehensiveProgressReportSchema = new mongoose.Schema({
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
  reportPeriod: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'],
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },

  // Academic Performance (Auto-populated from exam results)
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
      },
      examType: String, // Unit Test, Mid Term, Final Exam, etc.
      examDate: Date
    }],
    rank: Number,
    totalStudents: Number,
    previousRank: Number,
    rankImprovement: Number
  },

  // Attendance Record (Auto-populated from attendance module)
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
    },
    leaveApplications: {
      type: Number,
      default: 0
    },
    approvedLeaves: {
      type: Number,
      default: 0
    },
    rejectedLeaves: {
      type: Number,
      default: 0
    },
    monthlyBreakdown: [{
      month: String,
      present: Number,
      absent: Number,
      percentage: Number
    }]
  },

  // Assignment Performance (Auto-populated from assignment module)
  assignmentPerformance: {
    totalAssignments: {
      type: Number,
      default: 0
    },
    submittedAssignments: {
      type: Number,
      default: 0
    },
    pendingAssignments: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    assignments: [{
      subject: String,
      title: String,
      dueDate: Date,
      submittedDate: Date,
      score: Number,
      maxScore: Number,
      status: {
        type: String,
        enum: ['Submitted', 'Late', 'Pending', 'Not Submitted']
      },
      teacherFeedback: String
    }]
  },

  // Exam Performance (Auto-populated from exam module)
  examPerformance: {
    totalExams: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    highestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lowestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    exams: [{
      examName: String,
      examType: String,
      subject: String,
      examDate: Date,
      score: Number,
      maxScore: Number,
      percentage: Number,
      grade: String,
      rank: Number,
      totalStudents: Number
    }]
  },

  // Behavioral Assessment (Auto-populated from disciplinary records)
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
    remarks: String,
    disciplinaryIncidents: [{
      date: Date,
      type: String,
      description: String,
      severity: {
        type: String,
        enum: ['Minor', 'Moderate', 'Major']
      },
      actionTaken: String,
      resolved: Boolean
    }]
  },

  // Co-curricular Activities (Auto-populated from activities module)
  coCurricular: {
    sports: {
      participated: {
        type: Boolean,
        default: false
      },
      activities: [String],
      achievements: [String],
      rating: {
        type: String,
        enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
      },
      competitions: [{
        name: String,
        date: Date,
        position: String,
        certificate: String
      }]
    },
    cultural: {
      participated: {
        type: Boolean,
        default: false
      },
      activities: [String],
      achievements: [String],
      rating: {
        type: String,
        enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
      },
      performances: [{
        event: String,
        date: Date,
        role: String,
        recognition: String
      }]
    },
    academic: {
      participated: {
        type: Boolean,
        default: false
      },
      activities: [String],
      achievements: [String],
      rating: {
        type: String,
        enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
      },
      competitions: [{
        name: String,
        date: Date,
        position: String,
        certificate: String
      }]
    },
    clubs: [{
      name: String,
      role: String,
      activities: [String],
      achievements: [String]
    }]
  },

  // Skills Assessment (Auto-populated from various assessments)
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
    },
    teamwork: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    },
    leadership: {
      type: String,
      enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor']
    }
  },

  // Fee Status (Auto-populated from fee module)
  feeStatus: {
    totalFees: {
      type: Number,
      default: 0
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Overdue']
    },
    lastPaymentDate: Date,
    nextDueDate: Date,
    paymentHistory: [{
      date: Date,
      amount: Number,
      method: String,
      receipt: String
    }]
  },

  // Health Information (Auto-populated from health module)
  healthInfo: {
    height: Number,
    weight: Number,
    bmi: Number,
    bloodGroup: String,
    allergies: [String],
    medicalConditions: [String],
    lastCheckup: Date,
    healthIncidents: [{
      date: Date,
      type: String,
      description: String,
      actionTaken: String
    }]
  },

  // Goals and Targets
  goals: {
    academic: {
      currentTarget: String,
      achieved: Boolean,
      remarks: String,
      targetDate: Date
    },
    behavioral: {
      currentTarget: String,
      achieved: Boolean,
      remarks: String,
      targetDate: Date
    },
    personal: {
      currentTarget: String,
      achieved: Boolean,
      remarks: String,
      targetDate: Date
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
    },
    assignmentTrend: {
      type: String,
      enum: ['Improving', 'Stable', 'Declining']
    }
  },

  // Recommendations (Auto-generated based on performance)
  recommendations: {
    academic: [String],
    behavioral: [String],
    coCurricular: [String],
    health: [String],
    general: [String]
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
    acknowledgmentDate: Date,
    parentSignature: String,
    studentSignature: String
  },

  // Data Sources (for tracking which modules contributed data)
  dataSources: {
    attendance: {
      lastUpdated: Date,
      source: String
    },
    exams: {
      lastUpdated: Date,
      source: String
    },
    assignments: {
      lastUpdated: Date,
      source: String
    },
    behavior: {
      lastUpdated: Date,
      source: String
    },
    activities: {
      lastUpdated: Date,
      source: String
    },
    fees: {
      lastUpdated: Date,
      source: String
    },
    health: {
      lastUpdated: Date,
      source: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
comprehensiveProgressReportSchema.index({ studentId: 1, academicYear: 1, reportPeriod: 1 });
comprehensiveProgressReportSchema.index({ class: 1, section: 1 });
comprehensiveProgressReportSchema.index({ 'academicPerformance.overallGrade': 1 });
comprehensiveProgressReportSchema.index({ 'attendance.percentage': 1 });
comprehensiveProgressReportSchema.index({ status: 1 });

// Note: attendance.percentage is calculated in pre-save middleware

// Pre-save middleware to calculate attendance
comprehensiveProgressReportSchema.pre('save', function(next) {
  if (this.attendance.totalDays && this.attendance.daysPresent) {
    this.attendance.percentage = Math.round((this.attendance.daysPresent / this.attendance.totalDays) * 100);
  }
  next();
});

module.exports = mongoose.model('ComprehensiveProgressReport', comprehensiveProgressReportSchema); 