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
  status: { 
    type: String, 
    enum: ['Pending', 'HOD_Approved', 'Principal_Approved', 'Rejected', 'Published'], 
    default: 'Pending' 
  },
  hodApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  hodApprovedAt: Date,
  hodFeedback: String,
  principalApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  principalApprovedAt: Date,
  principalFeedback: String,
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  rejectedAt: Date,
  rejectionReason: String,
  currentApprover: {
    type: String,
    enum: ['HOD', 'Principal', 'Completed'],
    default: 'HOD'
  }
}, { timestamps: true });

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);