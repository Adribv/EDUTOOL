const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['Individual', 'Group', 'Crisis', 'Follow-up'],
    default: 'Individual'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled'
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  notes: {
    type: String,
    trim: true
  },
  concerns: [{
    type: String,
    enum: ['Academic Stress', 'Anxiety', 'Depression', 'Peer Pressure', 'Family Issues', 'Behavioral Issues', 'Other']
  }],
  interventions: [{
    type: String,
    enum: ['Cognitive Behavioral Therapy', 'Mindfulness', 'Stress Management', 'Social Skills Training', 'Family Therapy', 'Referral', 'Other']
  }],
  outcome: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative', 'Needs Follow-up']
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
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
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
sessionSchema.index({ studentId: 1, date: -1 });
sessionSchema.index({ counselorId: 1, date: -1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ type: 1 });

// Virtual for session duration in hours
sessionSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Method to check if session is overdue
sessionSchema.methods.isOverdue = function() {
  return this.status === 'Scheduled' && new Date() > this.date;
};

// Method to get session summary
sessionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    student: this.studentId,
    type: this.type,
    status: this.status,
    date: this.date,
    time: this.time,
    duration: this.duration,
    outcome: this.outcome
  };
};

// Static method to get upcoming sessions
sessionSchema.statics.getUpcomingSessions = function(counselorId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    counselorId,
    date: { $gte: startDate, $lte: endDate },
    status: 'Scheduled'
  }).populate('studentId', 'name class');
};

// Static method to get session statistics
sessionSchema.statics.getSessionStats = function(counselorId, period = 'month') {
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
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Session', sessionSchema); 