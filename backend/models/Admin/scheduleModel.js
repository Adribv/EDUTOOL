const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  class: { type: String, required: true },
  dayOfWeek: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], required: true },
  period: { type: Number, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  startTime: String,
  endTime: String,
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema); 