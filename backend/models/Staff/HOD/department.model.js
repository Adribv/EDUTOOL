const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Teacher', 'HOD', 'Admin'],
    required: false
  },
  department: {
    type: String
  },
  assignedSubjects: [
    {
      class: String,
      section: String,
      subject: String
    }
  ],
  assignedClasses: [
    {
      class: String,
      section: String
    }
  ],
  
  // ✅ New: Reference to TeacherProfile
  teacherProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherProfile' // 👈 should match the model name you create
  },
  // Add for Vice Principal
  vicePrincipal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  // Add teachers array for department
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }]

}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
