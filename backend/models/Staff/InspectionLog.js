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
    required: true
  },
  purposeOfVisit: {
    type: String,
    required: true,
    enum: ['Routine Check', 'Surprise Audit', 'Syllabus Review', 'Safety Inspection', 'Academic Review', 'Infrastructure Check', 'Compliance Audit', 'Other']
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
    default: false
  },
  nextVisitDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Completed', 'Follow-up Required'],
    default: 'Pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    required: false
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  department: {
    type: String,
    required: false
  },
  complianceStatus: {
    type: String,
    required: true,
    enum: ['Compliant', 'Partially Compliant', 'Non-Compliant', 'Under Review'],
    default: 'Under Review'
  }
}, {
  timestamps: true
});

// Index for better query performance
inspectionLogSchema.index({ dateOfInspection: -1 });
inspectionLogSchema.index({ purposeOfVisit: 1 });
inspectionLogSchema.index({ status: 1 });
inspectionLogSchema.index({ createdBy: 1 });
inspectionLogSchema.index({ nextVisitDate: 1 });

module.exports = mongoose.model('InspectionLog', inspectionLogSchema); 