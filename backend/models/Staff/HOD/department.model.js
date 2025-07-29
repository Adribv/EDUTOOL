const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  subjects: [{
    type: String
  }],
  email: {
    type: String, // Email is optional
    sparse: true // This allows multiple null values
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
  // Add HOD reference
  headOfDepartment: {
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
