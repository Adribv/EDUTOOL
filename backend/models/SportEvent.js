const mongoose = require('mongoose');

const sportEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    enum: [
      'Football',
      'Basketball',
      'Cricket',
      'Swimming',
      'Tennis',
      'Volleyball',
      'Badminton',
      'Athletics',
      'Table Tennis',
      'Hockey',
      'Multi-Sport',
      'Other'
    ],
    required: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'In Progress', 'Completed', 'Cancelled', 'Postponed'],
    default: 'Upcoming'
  },
  description: {
    type: String,
    trim: true
  },
  participants: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    role: {
      type: String,
      enum: ['Player', 'Captain', 'Substitute', 'Spectator'],
      default: 'Player'
    },
    team: String,
    performance: {
      score: Number,
      assists: Number,
      goals: Number,
      timePlayed: Number
    }
  }],
  teams: [{
    name: String,
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }],
    score: Number,
    position: Number
  }],
  maxParticipants: {
    type: Number,
    default: 50
  },
  registrationDeadline: {
    type: Date
  },
  equipment: [{
    name: String,
    quantity: Number,
    provided: {
      type: Boolean,
      default: false
    }
  }],
  rules: [String],
  prizes: [{
    position: Number,
    description: String,
    value: String
  }],
  officials: [{
    name: String,
    role: String,
    contact: String
  }],
  budget: {
    estimated: Number,
    actual: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number
  },
  photos: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  results: [{
    team: String,
    score: Number,
    position: Number,
    achievements: [String]
  }],
  feedback: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
sportEventSchema.index({ date: -1 });
sportEventSchema.index({ sport: 1 });
sportEventSchema.index({ status: 1 });
sportEventSchema.index({ organizerId: 1 });
sportEventSchema.index({ 'participants.studentId': 1 });

// Virtual for event age in days
sportEventSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days until event
sportEventSchema.virtual('daysUntilEvent').get(function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  return Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
});

// Method to check if event is full
sportEventSchema.methods.isFull = function() {
  return this.participants.length >= this.maxParticipants;
};

// Method to check if registration is open
sportEventSchema.methods.isRegistrationOpen = function() {
  if (!this.registrationDeadline) return true;
  return new Date() <= this.registrationDeadline;
};

// Method to get event summary
sportEventSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    sport: this.sport,
    date: this.date,
    venue: this.venue,
    status: this.status,
    participantsCount: this.participants.length,
    maxParticipants: this.maxParticipants
  };
};

// Static method to get upcoming events
sportEventSchema.statics.getUpcomingEvents = function(days = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    date: { $gte: startDate, $lte: endDate },
    status: 'Upcoming'
  }).sort({ date: 1 });
};

// Static method to get events by sport
sportEventSchema.statics.getEventsBySport = function(sport, period = 'month') {
  const startDate = new Date();
  
  if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === 'quarter') {
    startDate.setMonth(startDate.getMonth() - 3);
  } else if (period === 'year') {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }
  
  return this.find({
    sport,
    date: { $gte: startDate }
  }).sort({ date: -1 });
};

// Static method to get event statistics
sportEventSchema.statics.getEventStats = function(organizerId, period = 'month') {
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
        organizerId: mongoose.Types.ObjectId(organizerId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalParticipants: { $sum: { $size: '$participants' } }
      }
    }
  ]);
};

// Pre-save middleware to validate dates
sportEventSchema.pre('save', function(next) {
  if (this.registrationDeadline && this.registrationDeadline > this.date) {
    return next(new Error('Registration deadline cannot be after event date'));
  }
  next();
});

module.exports = mongoose.model('SportEvent', sportEventSchema); 