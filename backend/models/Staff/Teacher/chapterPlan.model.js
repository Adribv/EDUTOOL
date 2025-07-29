const mongoose = require('mongoose');

const chapterPlanSchema = new mongoose.Schema({
  title: String,
  description: String,
  class: String,
  section: String,
  subject: String,
  startDate: Date,
  endDate: Date,
  topics: [{
    title: String,
    description: String,
    duration: Number // in days
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('ChapterPlan', chapterPlanSchema);