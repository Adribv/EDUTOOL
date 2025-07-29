const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  attachmentUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  status: { 
    type: String, 
    enum: ['Planned', 'In Progress', 'Completed', 'Evaluated'],
    default: 'Planned'
  },
  evaluationCriteria: [{
    criterion: String,
    weightage: Number
  }],
  groups: [{
    name: String,
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);