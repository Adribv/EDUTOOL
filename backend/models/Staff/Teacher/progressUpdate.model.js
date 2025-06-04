const mongoose = require('mongoose');

const progressUpdateSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: Date, default: Date.now },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  attachmentUrl: String,
  read: { type: Boolean, default: false },
  readDate: Date
}, { timestamps: true });

module.exports = mongoose.model('ProgressUpdate', progressUpdateSchema);