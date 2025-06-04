const mongoose = require('mongoose');

const academicSuggestionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Teaching Methods', 'Curriculum', 'Assessment', 'Resources', 'Technology', 'Other'],
    required: true
  },
  targetAudience: { 
    type: String, 
    enum: ['Department', 'School Administration', 'All Teachers'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Approved', 'Implemented', 'Rejected'],
    default: 'Submitted'
  },
  feedback: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('AcademicSuggestion', academicSuggestionSchema);