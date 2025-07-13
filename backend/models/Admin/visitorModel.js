const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  whomToMeet: {
    type: String,
    required: true
  },
  idProofType: {
    type: String,
    enum: ['Aadhar Card', 'Driving License', 'Voter ID', 'Passport', 'Other'],
    required: true
  },
  idProofNumber: {
    type: String,
    required: true
  },
  parentName: String,
  wardPickup: {
    type: Boolean,
    default: false,
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: Date,
  expectedExitTime: Date,
  remarks: String,
  status: {
    type: String,
    enum: ['Inside', 'Left', 'Overstayed'],
    default: 'Inside'
  },
  attachDocument: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);