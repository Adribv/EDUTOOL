const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: Number,
  remarks: String
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  participants: [{
    type: String
  }],
  resources: [resourceSchema],
  budget: {
    estimated: Number,
    actual: Number
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  bookingDetails: {
    contactNumber: String,
    requirements: String
  }
}, { timestamps: true });

// Update status based on dates
eventSchema.pre('save', function(next) {
  const now = new Date();
  if (this.status !== 'Cancelled') {
    if (now < this.startDate) {
      this.status = 'Scheduled';
    } else if (now >= this.startDate && now <= this.endDate) {
      this.status = 'In Progress';
    } else if (now > this.endDate) {
      this.status = 'Completed';
    }
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);