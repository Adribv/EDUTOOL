const mongoose = require('mongoose');

const consentFormSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  schoolName: String,
  address: String,
  phone: String,
  title: String,
  purpose: String,
  dateFrom: Date,
  dateTo: Date,
  departureTime: String,
  returnTime: String,
  venue: String,
  transportMode: String,
  teacherIncharge: String,
  teacherContact: String,
  // Parent-side / student details
  studentName: String,
  classSection: String,
  rollNumber: String,
  parentName: String,
  relationship: String,
  mobile: String,
  emergencyContact: String,
  allergies: String,
  medication: String,
  parentSignature: String, // base64 or file url
  signedAt: Date,
  status: {
    type: String,
    enum: ['draft', 'awaitingParent', 'completed'],
    default: 'draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('ConsentForm', consentFormSchema); 