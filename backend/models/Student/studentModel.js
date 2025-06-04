const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: String,
  contactNumber: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  }],
  profilePhoto: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Graduated'],
    default: 'Active'
  },
  bloodGroup: String,
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);