const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentType: {
    type: String,
    enum: [
      'Anxiety Screening',
      'Depression Screening',
      'Stress Assessment',
      'Behavioral Assessment',
      'ADHD Screening',
      'Eating Disorder Screening',
      'Substance Abuse Screening',
      'Suicide Risk Assessment',
      'Trauma Assessment',
      'Social Skills Assessment'
    ],
    required: true
  },
  score: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    required: true
  },
  numericalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  questions: [{
    question: String,
    answer: String,
    score: Number
  }],
  notes: {
    type: String,
    trim: true
  },
  recommendations: [{
    type: String,
    enum: [
      'Individual Counseling',
      'Group Therapy',
      'Family Therapy',
      'Medication Evaluation',
      'Academic Support',
      'Social Skills Training',
      'Stress Management',
      'Crisis Intervention',
      'Referral to Specialist',
      'Monitoring',
      'No Action Required'
    ]
  }],
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  parentNotification: {
    type: Boolean,
    default: false
  },
  parentNotifiedDate: {
    type: Date
  },
  confidentialityLevel: {
    type: String,
    enum: ['Standard', 'High', 'Critical'],
    default: 'Standard'
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  previousAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  },
  improvement: {
    type: String,
    enum: ['Significant Improvement', 'Moderate Improvement', 'No Change', 'Decline', 'Significant Decline']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
assessmentSchema.index({ studentId: 1, createdAt: -1 });
assessmentSchema.index({ counselorId: 1, createdAt: -1 });
assessmentSchema.index({ assessmentType: 1 });
assessmentSchema.index({ score: 1 });
assessmentSchema.index({ riskLevel: 1 });

// Virtual for assessment age in days
assessmentSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if assessment needs follow-up
assessmentSchema.methods.needsFollowUp = function() {
  return this.followUpRequired && this.followUpDate && new Date() >= this.followUpDate;
};

// Method to get assessment summary
assessmentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    student: this.studentId,
    type: this.assessmentType,
    score: this.score,
    riskLevel: this.riskLevel,
    date: this.createdAt,
    followUpRequired: this.followUpRequired
  };
};

// Static method to get high-risk assessments
assessmentSchema.statics.getHighRiskAssessments = function() {
  return this.find({
    $or: [
      { score: 'High' },
      { score: 'Critical' },
      { riskLevel: 'High' },
      { riskLevel: 'Critical' }
    ]
  }).populate('studentId', 'name class');
};

// Static method to get assessment trends
assessmentSchema.statics.getAssessmentTrends = function(studentId, period = 'month') {
  const startDate = new Date();
  
  if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === 'quarter') {
    startDate.setMonth(startDate.getMonth() - 3);
  } else if (period === 'year') {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }
  
  return this.aggregate([
    {
      $match: {
        studentId: mongoose.Types.ObjectId(studentId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$assessmentType',
        count: { $sum: 1 },
        avgScore: { $avg: '$numericalScore' },
        latestScore: { $last: '$score' }
      }
    }
  ]);
};

// Static method to get assessment statistics
assessmentSchema.statics.getAssessmentStats = function(counselorId, period = 'month') {
  const startDate = new Date();
  
  if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === 'quarter') {
    startDate.setMonth(startDate.getMonth() - 3);
  } else if (period === 'year') {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }
  
  return this.aggregate([
    {
      $match: {
        counselorId: mongoose.Types.ObjectId(counselorId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$assessmentType',
        count: { $sum: 1 },
        lowRisk: {
          $sum: { $cond: [{ $in: ['$score', ['Low']] }, 1, 0] }
        },
        moderateRisk: {
          $sum: { $cond: [{ $in: ['$score', ['Moderate']] }, 1, 0] }
        },
        highRisk: {
          $sum: { $cond: [{ $in: ['$score', ['High', 'Critical']] }, 1, 0] }
        }
      }
    }
  ]);
};

// Pre-save middleware to set risk level based on score
assessmentSchema.pre('save', function(next) {
  if (this.score === 'Low') {
    this.riskLevel = 'Low';
  } else if (this.score === 'Moderate') {
    this.riskLevel = 'Medium';
  } else if (this.score === 'High') {
    this.riskLevel = 'High';
  } else if (this.score === 'Critical') {
    this.riskLevel = 'Critical';
  }
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema); 