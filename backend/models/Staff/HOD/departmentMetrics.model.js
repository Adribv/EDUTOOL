const mongoose = require('mongoose');

const departmentMetricsSchema = new mongoose.Schema({
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
  academicYear: { 
    type: String, 
    required: true 
  },
  term: { 
    type: String, 
    required: true 
  },
  metrics: {
    averageStudentPerformance: Number,
    teacherAttendanceRate: Number,
    studentAttendanceRate: Number,
    resourceUtilization: Number,
    examResults: [{
      examName: String,
      averageScore: Number,
      passRate: Number
    }]
  },
  goals: [{
    title: String,
    description: String,
    targetDate: Date,
    status: { 
      type: String, 
      enum: ['Not Started', 'In Progress', 'Completed'], 
      default: 'Not Started' 
    }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  }
}, { timestamps: true });

module.exports = mongoose.model('DepartmentMetrics', departmentMetricsSchema);