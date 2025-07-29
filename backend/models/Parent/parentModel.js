const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  contactNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  childRollNumbers: [{ type: String }], // link by rollNumber
  profilePhoto: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Parent', parentSchema);