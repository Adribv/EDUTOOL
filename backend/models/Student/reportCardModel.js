const mongoose = require('mongoose');

const reportCardSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
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
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subjects: [{
    name: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      required: true
    },
    grade: {
      type: String,
      required: true
    },
    teacherRemarks: String
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  averagePercentage: {
    type: Number,
    required: true
  },
  rank: Number,
  attendance: {
    totalDays: Number,
    daysPresent: Number,
    percentage: Number
  },
  classTeacherRemarks: String,
  principalRemarks: String,
  issuedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('ReportCard', reportCardSchema);