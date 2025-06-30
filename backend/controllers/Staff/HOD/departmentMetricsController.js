const DepartmentMetrics = require('../../../models/Staff/HOD/departmentMetrics.model');
const Department = require('../../../models/Staff/HOD/department.model');
const Attendance = require('../../../models/Staff/Teacher/attendance.model');
const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
const Student = require('../../../models/Student/studentModel');
const Staff = require('../../../models/Staff/staffModel');

// Record department metrics
exports.recordMetrics = async (req, res) => {
  try {
    const { academicYear, term, metrics, goals } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if metrics already exist for this period
    let departmentMetrics = await DepartmentMetrics.findOne({
      departmentId: department._id,
      academicYear,
      term
    });
    
    if (departmentMetrics) {
      // Update existing metrics
      departmentMetrics.metrics = metrics || departmentMetrics.metrics;
      departmentMetrics.goals = goals || departmentMetrics.goals;
    } else {
      // Create new metrics
      departmentMetrics = new DepartmentMetrics({
        departmentId: department._id,
        academicYear,
        term,
        metrics,
        goals,
        createdBy: req.user.id
      });
    }
    
    await departmentMetrics.save();
    res.status(201).json({ message: 'Department metrics recorded successfully', departmentMetrics });
  } catch (error) {
    console.error('Error recording department metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get department metrics - real implementation
exports.getDepartmentMetrics = async (req, res) => {
  try {
    // Get department for the current HOD
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    });
    
    // Get students in department classes
    const students = await Student.find({
      class: { $in: department.subjects.map(subject => {
        // Map subjects to class names (this might need adjustment based on your data structure)
        const subjectToClassMap = {
          'Physics': ['9', '10', '11', '12'],
          'Chemistry': ['9', '10', '11', '12'],
          'Biology': ['9', '10', '11', '12'],
          'Mathematics': ['6', '7', '8', '9', '10', '11', '12'],
          'English': ['6', '7', '8', '9', '10', '11', '12'],
          'History': ['6', '7', '8', '9', '10'],
          'Geography': ['6', '7', '8', '9', '10'],
          'Computer Science': ['9', '10', '11', '12']
        };
        return subjectToClassMap[subject] || [];
      }).flat() }
    });
    
    // Calculate attendance statistics
    const teacherAttendance = await Attendance.find({
      markedBy: { $in: teachers.map(t => t._id) }
    }).sort({ date: -1 }).limit(30); // Last 30 days
    
    const attendanceStats = {
      totalDays: teacherAttendance.length,
      presentDays: teacherAttendance.filter(a => a.status === 'present').length,
      absentDays: teacherAttendance.filter(a => a.status === 'absent').length,
      lateDays: teacherAttendance.filter(a => a.status === 'late').length,
      attendanceRate: teacherAttendance.length > 0 ? 
        (teacherAttendance.filter(a => a.status === 'present').length / teacherAttendance.length) * 100 : 0
    };
    
    // Get exam results for department subjects
    const examResults = await ExamResult.find({
      subject: { $in: department.subjects }
    });
    
    const performanceStats = {
      totalExams: examResults.length,
      averageScore: examResults.length > 0 ? 
        examResults.reduce((sum, result) => sum + (result.score || 0), 0) / examResults.length : 0,
      passingRate: examResults.length > 0 ? 
        (examResults.filter(result => (result.score || 0) >= 60).length / examResults.length) * 100 : 0
    };
    
    const metrics = {
      departmentName: department.name,
      totalTeachers: teachers.length,
      totalStudents: students.length,
      subjects: department.subjects,
      attendanceStats,
      performanceStats,
      activeCourses: department.subjects.length,
      lastUpdated: new Date()
    };
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching department metrics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// Generate department performance report
exports.generatePerformanceReport = async (req, res) => {
  try {
    const { academicYear, term } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    });
    
    // Calculate teacher attendance
    const teacherAttendanceData = await calculateTeacherAttendance(teachers, academicYear, term);
    
    // Calculate student performance
    const studentPerformanceData = await calculateStudentPerformance(department, academicYear, term);
    
    // Calculate resource utilization
    // This would typically involve more complex logic based on your specific requirements
    
    const report = {
      departmentName: department.name,
      academicYear,
      term,
      teacherMetrics: teacherAttendanceData,
      studentMetrics: studentPerformanceData,
      generatedAt: new Date(),
      generatedBy: req.user.id
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate teacher attendance
async function calculateTeacherAttendance(teachers, academicYear, term) {
  // This is a placeholder. You would need to implement the actual calculation
  // based on your attendance model and business logic
  return {
    averageAttendance: 92.5,
    teacherData: teachers.map(teacher => ({
      teacherId: teacher._id,
      name: teacher.name,
      attendanceRate: Math.floor(Math.random() * 15) + 85 // Random value between 85-100 for demo
    }))
  };
}

// Helper function to calculate student performance
async function calculateStudentPerformance(department, academicYear, term) {
  // This is a placeholder. You would need to implement the actual calculation
  // based on your exam results model and business logic
  return {
    averageScore: 78.3,
    passingRate: 92.1,
    subjectData: department.subjects.map(subject => ({
      subject,
      averageScore: Math.floor(Math.random() * 20) + 70 // Random value between 70-90 for demo
    }))
  };
}

// Update department goals
exports.updateGoals = async (req, res) => {
  try {
    const { metricsId } = req.params;
    const { goals } = req.body;
    
    const metrics = await DepartmentMetrics.findById(metricsId);
    
    if (!metrics) {
      return res.status(404).json({ message: 'Metrics not found' });
    }
    
    // Get department
    const department = await Department.findById(metrics.departmentId);
    
    // Check if HOD is authorized
    if (department.headOfDepartment.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update these goals' });
    }
    
    metrics.goals = goals;
    await metrics.save();
    
    res.json({ message: 'Department goals updated successfully', metrics });
  } catch (error) {
    console.error('Error updating department goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all metrics
exports.getMetrics = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const metrics = await DepartmentMetrics.find({
      departmentId: department._id
    }).sort({ createdAt: -1 });
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching department metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get department performance
exports.getDepartmentPerformance = async (req, res) => {
  try {
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    });
    
    // Get recent exam results
    const examResults = await ExamResult.find({
      subject: { $in: department.subjects }
    }).sort({ date: -1 }).limit(100);
    
    // Calculate performance metrics
    const academicScore = examResults.length > 0 ? 
      examResults.reduce((sum, result) => sum + (result.score || 0), 0) / examResults.length : 0;
    
    // Get attendance data
    const attendanceRecords = await Attendance.find({
      markedBy: { $in: teachers.map(t => t._id) }
    }).sort({ date: -1 }).limit(30);
    
    const attendanceRate = attendanceRecords.length > 0 ? 
      (attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length) * 100 : 0;
    
    const performance = {
      academicScore: Math.round(academicScore * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      totalTeachers: teachers.length,
      totalExams: examResults.length,
      totalAttendanceRecords: attendanceRecords.length
    };
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching department performance:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get department attendance
exports.getDepartmentAttendance = async (req, res) => {
  try {
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    });
    
    const attendanceRecords = await Attendance.find({
      markedBy: { $in: teachers.map(t => t._id) }
    }).sort({ date: -1 }).limit(50);
    
    const attendanceData = attendanceRecords.map(record => ({
      teacherId: record.markedBy,
      date: record.date,
      status: record.status,
      timeIn: record.timeIn,
      timeOut: record.timeOut,
      remarks: record.remarks
    }));
    
    res.json({
      success: true,
      data: attendanceData
    });
  } catch (error) {
    console.error('Error fetching department attendance:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};