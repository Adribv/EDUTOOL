// Add models/attendance.model.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  class: String,
  section: String,
  date: Date,
  attendanceData: [{
    studentRollNumber: String,
    studentName: String,
    status: { 
      type: String, 
      enum: ['Present', 'Absent', 'Leave', 'Late'] 
    },
    remarks: String
  }],
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);