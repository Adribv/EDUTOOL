const mongoose = require('mongoose');

const studentPerformanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  class: String,
  section: String,
  subject: String,
  term: String,
  academicYear: String,
  assessments: [{
    type: { type: String, enum: ['Exam', 'Assignment', 'Project', 'ClassParticipation'] },
    title: String,
    score: Number,
    maxScore: Number,
    date: Date,
    remarks: String
  }],
  behavioralObservations: [{
    date: Date,
    observation: String,
    category: { type: String, enum: ['Positive', 'Negative', 'Neutral'] }
  }],
  needsRemedial: { type: Boolean, default: false },
  interventionPlan: {
    description: String,
    startDate: Date,
    endDate: Date,
    strategies: [String],
    progress: String
  },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('StudentPerformance', studentPerformanceSchema);