const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: String,
  description: String,
  class: String,
  section: String,
  subject: String,
  date: Date,
  duration: Number, // in minutes
  totalMarks: Number,
  questionPaperUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);