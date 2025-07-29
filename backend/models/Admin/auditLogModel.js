const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  dateOfAudit: { type: Date, required: true },
  auditType: { type: String, required: true, enum: ['Financial', 'Academic', 'Safety', 'Infrastructure', 'Administrative', 'Other'] },
  auditorName: { type: String, required: true },
  auditorDesignation: { type: String, required: true },
  scopeOfAudit: { type: String, required: true },
  complianceStatus: { type: String, required: true, enum: ['Compliant', 'Partially Compliant', 'Non-Compliant'] },
  nonConformities: { type: String },
  recommendations: { type: String },
  responsiblePerson: { type: String, required: true },
  targetCompletionDate: { type: Date, required: true },
  status: { type: String, required: true, enum: ['Open', 'Closed'] },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema); 