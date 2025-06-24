const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  content: String,
  submissionDate: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: Date.now },
  fileUrl: String,
  grade: String,
  feedback: String,
  status: { type: String, enum: ['Submitted', 'Graded', 'Late'], default: 'Submitted' }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);