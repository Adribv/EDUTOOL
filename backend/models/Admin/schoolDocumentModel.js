const mongoose = require('mongoose');

const schoolDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  documentType: {
    type: String,
    enum: ['Policy', 'Guideline', 'Newsletter', 'Certificate', 'Publication'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  targetAudience: [{
    type: String,
    enum: ['Students', 'Parents', 'Staff', 'All']
  }],
  publishedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('SchoolDocument', schoolDocumentSchema);