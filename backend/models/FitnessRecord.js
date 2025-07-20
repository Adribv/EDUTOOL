const mongoose = require('mongoose');

const fitnessRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Basic Measurements
  height: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['cm', 'inches'],
      default: 'cm'
    }
  },
  weight: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  bmi: {
    type: Number,
    required: true
  },
  // Fitness Tests
  fitnessScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  // Cardiovascular Fitness
  cardiovascular: {
    restingHeartRate: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    vo2Max: Number,
    enduranceTest: {
      type: String,
      enum: ['1-Mile Run', '12-Minute Run', 'Beep Test', 'Step Test', 'Other']
    },
    enduranceScore: Number
  },
  // Strength Tests
  strength: {
    pushUps: Number,
    pullUps: Number,
    sitUps: Number,
    plankTime: Number, // in seconds
    squatTest: Number,
    gripStrength: {
      left: Number,
      right: Number
    }
  },
  // Flexibility Tests
  flexibility: {
    sitAndReach: Number,
    shoulderFlexibility: Number,
    trunkFlexibility: Number,
    overallFlexibilityScore: Number
  },
  // Speed and Agility
  speed: {
    sprint50m: Number,
    sprint100m: Number,
    agilityTest: Number,
    reactionTime: Number
  },
  // Body Composition
  bodyComposition: {
    bodyFatPercentage: Number,
    muscleMass: Number,
    boneDensity: Number,
    hydrationLevel: Number
  },
  // Health Status
  healthStatus: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'],
    default: 'Average'
  },
  // Medical Considerations
  medicalNotes: {
    injuries: [{
      type: String,
      severity: String,
      date: Date,
      recoveryStatus: String
    }],
    medications: [String],
    allergies: [String],
    restrictions: [String]
  },
  // Goals and Progress
  goals: [{
    type: String,
    target: Number,
    current: Number,
    deadline: Date,
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Failed'],
      default: 'Not Started'
    }
  }],
  // Recommendations
  recommendations: [{
    type: String,
    description: String,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    completedDate: Date
  }],
  // Notes and Comments
  notes: {
    type: String,
    trim: true
  },
  // Attachments
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Previous Record Reference
  previousRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FitnessRecord'
  },
  // Improvement Tracking
  improvement: {
    type: String,
    enum: ['Significant Improvement', 'Moderate Improvement', 'No Change', 'Decline', 'Significant Decline']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
fitnessRecordSchema.index({ studentId: 1, date: -1 });
fitnessRecordSchema.index({ teacherId: 1, date: -1 });
fitnessRecordSchema.index({ date: -1 });
fitnessRecordSchema.index({ healthStatus: 1 });
fitnessRecordSchema.index({ fitnessScore: -1 });

// Virtual for age in days
fitnessRecordSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.date) / (1000 * 60 * 60 * 24));
});

// Virtual for BMI category
fitnessRecordSchema.virtual('bmiCategory').get(function() {
  if (this.bmi < 18.5) return 'Underweight';
  if (this.bmi < 25) return 'Normal';
  if (this.bmi < 30) return 'Overweight';
  return 'Obese';
});

// Virtual for fitness level
fitnessRecordSchema.virtual('fitnessLevel').get(function() {
  if (this.fitnessScore >= 90) return 'Excellent';
  if (this.fitnessScore >= 80) return 'Good';
  if (this.fitnessScore >= 70) return 'Average';
  if (this.fitnessScore >= 60) return 'Below Average';
  return 'Poor';
});

// Method to calculate BMI
fitnessRecordSchema.methods.calculateBMI = function() {
  const heightInMeters = this.height.unit === 'cm' ? this.height.value / 100 : this.height.value * 0.0254;
  const weightInKg = this.weight.unit === 'kg' ? this.weight.value : this.weight.value * 0.453592;
  return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
};

// Method to get fitness summary
fitnessRecordSchema.methods.getFitnessSummary = function() {
  return {
    id: this._id,
    student: this.studentId,
    date: this.date,
    bmi: this.bmi,
    bmiCategory: this.bmiCategory,
    fitnessScore: this.fitnessScore,
    fitnessLevel: this.fitnessLevel,
    healthStatus: this.healthStatus
  };
};

// Static method to get student fitness history
fitnessRecordSchema.statics.getStudentHistory = function(studentId, limit = 10) {
  return this.find({ studentId })
    .sort({ date: -1 })
    .limit(limit);
};

// Static method to get fitness trends
fitnessRecordSchema.statics.getFitnessTrends = function(studentId, period = 'month') {
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
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
        avgFitnessScore: { $avg: '$fitnessScore' },
        avgBMI: { $avg: '$bmi' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get class fitness statistics
fitnessRecordSchema.statics.getClassStats = function(classId, period = 'month') {
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
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $match: {
        'student.class': classId,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgFitnessScore: { $avg: '$fitnessScore' },
        avgBMI: { $avg: '$bmi' },
        totalRecords: { $sum: 1 },
        excellentCount: {
          $sum: { $cond: [{ $gte: ['$fitnessScore', 90] }, 1, 0] }
        },
        goodCount: {
          $sum: { $cond: [{ $and: [{ $gte: ['$fitnessScore', 80] }, { $lt: ['$fitnessScore', 90] }] }, 1, 0] }
        },
        averageCount: {
          $sum: { $cond: [{ $and: [{ $gte: ['$fitnessScore', 70] }, { $lt: ['$fitnessScore', 80] }] }, 1, 0] }
        },
        belowAverageCount: {
          $sum: { $cond: [{ $and: [{ $gte: ['$fitnessScore', 60] }, { $lt: ['$fitnessScore', 70] }] }, 1, 0] }
        },
        poorCount: {
          $sum: { $cond: [{ $lt: ['$fitnessScore', 60] }, 1, 0] }
        }
      }
    }
  ]);
};

// Pre-save middleware to calculate BMI
fitnessRecordSchema.pre('save', function(next) {
  if (this.height && this.weight) {
    this.bmi = parseFloat(this.calculateBMI());
  }
  next();
});

// Pre-save middleware to validate data
fitnessRecordSchema.pre('save', function(next) {
  if (this.height.value <= 0 || this.weight.value <= 0) {
    return next(new Error('Height and weight must be positive values'));
  }
  if (this.fitnessScore < 0 || this.fitnessScore > 100) {
    return next(new Error('Fitness score must be between 0 and 100'));
  }
  next();
});

module.exports = mongoose.model('FitnessRecord', fitnessRecordSchema); 