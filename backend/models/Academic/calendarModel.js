const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  eventType: {
    type: String,
    enum: ['Academic', 'Exam', 'Holiday', 'Event', 'Meeting', 'Sports', 'Cultural', 'Other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  targetAudience: {
    type: [{
      type: String,
      enum: ['Students', 'Teachers', 'Staff', 'Parents', 'All']
    }],
    default: ['All']
  },
  location: String,
  organizer: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Cancelled', 'Deleted'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Calendar', calendarSchema);