const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileUrl: String,
  pdfUrl: String,
  videoLink: String,
  videoUrl: String,
  class: String,
  section: String,
  subject: String,
  isPublished: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);