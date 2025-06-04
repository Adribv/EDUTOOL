const mongoose = require('mongoose');

const extracurricularAchievementSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ['Sports', 'Arts', 'Music', 'Debate', 'Science', 'Community Service', 'Other'],
    required: true
  },
  level: { 
    type: String, 
    enum: ['School', 'District', 'State', 'National', 'International'],
    required: true
  },
  position: String,
  certificateUrl: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ExtracurricularAchievement', extracurricularAchievementSchema);