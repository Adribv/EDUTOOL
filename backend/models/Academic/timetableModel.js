const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: String
});

const dayScheduleSchema = new mongoose.Schema({
  periods: [periodSchema]
});

const timetableSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, { timestamps: true });

// Ensure unique timetable for class-section combination in an academic year and term
timetableSchema.index({ class: 1, section: 1, academicYear: 1, term: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);