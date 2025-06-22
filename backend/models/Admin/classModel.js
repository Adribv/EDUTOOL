const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Class 6A"
  grade: { type: String, required: true },
  section: { type: String, required: true },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  capacity: { type: Number, default: 40 },
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema); 