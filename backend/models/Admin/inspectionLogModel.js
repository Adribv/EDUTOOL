const mongoose = require('mongoose');

const inspectionLogSchema = new mongoose.Schema({
  dateOfInspection: {
    type: Date,
    required: true,
    default: Date.now
  },
  inspectorName: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true,
    enum: ['DEO', 'Cluster Officer', 'Principal', 'VP', 'HOD', 'Other']
  },
  purposeOfVisit: {
    type: String,
    required: true,
    enum: ['Routine Check', 'Surprise Audit', 'Syllabus Review', 'Safety Inspection', 'Academic Review', 'Infrastructure Check', 'Other']
  },
  summaryOfObservations: {
    type: String,
    required: true
  },
  recommendationsGiven: {
    type: String,
    required: false
  },
  actionTakenBySchool: {
    type: String,
    required: false
  },
  followUpRequired: {
    type: Boolean,
    required: true,
    default: false
  },
  nextVisitDate: {
    type: Date,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

// Index for better query performance
inspectionLogSchema.index({ dateOfInspection: -1 });
inspectionLogSchema.index({ designation: 1 });
inspectionLogSchema.index({ purposeOfVisit: 1 });
inspectionLogSchema.index({ followUpRequired: 1 });
inspectionLogSchema.index({ createdBy: 1 });

module.exports = mongoose.model('InspectionLog', inspectionLogSchema); 