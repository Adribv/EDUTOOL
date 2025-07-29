const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: String,
  description: String,
  class: String,
  section: String,
  subject: String,
  subjects: [String], // For multiple subjects
  date: Date,
  duration: Number, // in minutes
  totalMarks: Number,
  questionPaperUrl: String,
  venue: String,
  instructions: String,
  admitCardsAvailable: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['UnitTest', 'MidTerm', 'Final', 'Other'],
    default: 'Other'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);