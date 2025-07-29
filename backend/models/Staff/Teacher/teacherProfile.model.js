const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  contactInfo: {
    phone: String,
    alternateEmail: String,
    address: String
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    documentUrl: String
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date,
    documentUrl: String
  }],
  professionalDevelopment: [{
    title: String,
    description: String,
    completionDate: Date,
    documentUrl: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);