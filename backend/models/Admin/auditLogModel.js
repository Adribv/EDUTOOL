const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  dateOfAudit: {
    type: Date,
    required: true,
    default: Date.now
  },
  auditType: {
    type: String,
    required: true,
    enum: ['Financial', 'Academic', 'Safety', 'Infrastructure', 'Administrative', 'Other']
  },
  auditorName: {
    type: String,
    required: true
  },
  auditorDesignation: {
    type: String,
    required: true
  },
  scopeOfAudit: {
    type: String,
    required: true
  },
  complianceStatus: {
    type: String,
    required: true,
    enum: ['Compliant', 'Partially Compliant', 'Non-Compliant']
  },
  nonConformitiesIdentified: {
    type: String,
    required: false
  },
  recommendations: {
    type: String,
    required: false
  },
  correctiveActions: {
    type: String,
    required: false
  },
  responsiblePerson: {
    type: String,
    required: true
  },
  targetCompletionDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open'
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
auditLogSchema.index({ dateOfAudit: -1 });
auditLogSchema.index({ auditType: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ responsiblePerson: 1 });

module.exports = mongoose.model('AdminAuditLog', auditLogSchema); 