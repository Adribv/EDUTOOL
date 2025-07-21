const mongoose = require('mongoose');

const CounsellingRequestSchema = new mongoose.Schema({
  schoolName: String,
  dateOfRequest: Date,
  requestedBy: String, // Student, Parent, Teacher, Other
  requestedByOther: String,
  studentDetails: {
    fullName: String,
    gradeClassSection: String,
    rollNumber: String,
    age: Number,
    gender: String,
  },
  parentGuardianName: String,
  contactNumber: String,
  email: String,
  reasons: [String],
  reasonOther: String,
  briefDescription: String,
  preferredMode: String, // One-on-One, Online, Group, No preference
  preferredTime: String,
  signature: String,
  date: Date,
  // For counsellor use
  dateReceived: Date,
  assignedCounsellor: String,
  sessionDate: Date,
  notes: String,
});

module.exports = mongoose.model('CounsellingRequest', CounsellingRequestSchema); 