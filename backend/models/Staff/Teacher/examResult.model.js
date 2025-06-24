const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  marksObtained: Number,
  score: Number, // Percentage score
  totalMarks: Number,
  feedback: String,
  grade: String,
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('ExamResult', examResultSchema);