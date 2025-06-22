const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  grade: { type: String, required: true },
  description: String,
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema); 