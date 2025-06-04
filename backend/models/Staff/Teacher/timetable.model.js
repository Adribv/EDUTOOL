const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  periods: [{
    periodNumber: Number,
    startTime: String,
    endTime: String,
    class: String,
    section: String,
    subject: String,
    isBreak: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Check if the model already exists before defining it
module.exports = mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);