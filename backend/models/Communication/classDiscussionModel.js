const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'comments.postedByModel',
    required: true
  },
  postedByModel: {
    type: String,
    enum: ['Staff', 'Student'],
    default: 'Staff'
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
});

const classDiscussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subject: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  comments: [commentSchema],
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('ClassDiscussion', classDiscussionSchema);