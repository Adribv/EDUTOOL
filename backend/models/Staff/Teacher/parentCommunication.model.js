const mongoose = require('mongoose');

const parentCommunicationSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: Date, default: Date.now },
  communicationType: { 
    type: String, 
    enum: ['Meeting', 'Phone Call', 'Email', 'Message', 'Other'],
    required: true
  },
  subject: { type: String, required: true },
  details: { type: String, required: true },
  outcome: String,
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,
  followUpDetails: String,
  followUpCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ParentCommunication', parentCommunicationSchema);