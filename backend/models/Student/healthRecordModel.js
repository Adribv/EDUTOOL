const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  medicalConditions: [String],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  bloodGroup: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  incidents: [{
    date: Date,
    description: String,
    actionTaken: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'incidents.reportedByModel'
    },
    reportedByModel: {
      type: String,
      enum: ['Staff', 'Student']
    }
  }],
  counselorRecommendations: [{
    date: Date,
    recommendation: String,
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    isSharedWithParent: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);