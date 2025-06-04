const mongoose = require('mongoose');

const studentContributionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  evaluationScore: Number,
  feedback: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }
}, { timestamps: true });

module.exports = mongoose.model('StudentContribution', studentContributionSchema);