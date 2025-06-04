// Add models/attendance.model.js
const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
    studentRollNumber: String,
    date: Date,
    status: { type: String, enum: ['Present', 'Absent', 'Leave'] },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Attendance', attendanceSchema);