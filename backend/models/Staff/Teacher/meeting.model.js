const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  startTime: String,
  endTime: String,
  location: String,
  meetingWith: { type: String, enum: ['Parent', 'Staff', 'Student'] },
  participants: [{
    participantId: { type: mongoose.Schema.Types.ObjectId, refPath: 'participantModel' },
    participantModel: { type: String, enum: ['Staff', 'Student', 'Parent'] },
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' }
  }],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);