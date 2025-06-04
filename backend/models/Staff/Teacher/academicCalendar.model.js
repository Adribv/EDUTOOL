const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  type: { type: String, enum: ['Exam', 'Holiday', 'Event', 'Meeting'] },
  forClasses: [String], // Array of class names or 'All'
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);