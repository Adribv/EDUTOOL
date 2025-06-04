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

// Get department metrics
exports.getDepartmentMetrics = async (req, res) => {
  try {
    const { academicYear, term } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const metrics = await DepartmentMetrics.findOne({
      departmentId: department._id,
      academicYear,
      term
    });
    
    if (!metrics) {
      return res.status(404).json({ message: 'Metrics not found for this period' });
    }
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching department metrics:', error);
    res.status(500).json({ message: 'Server error' });
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
    const { academicYear, term } = req.query;
    
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
    
    // Get department metrics for this period if they exist
    const departmentMetrics = await DepartmentMetrics.findOne({
      departmentId: department._id,
      academicYear,
      term
    });
    
    const performanceReport = {
      departmentName: department.name,
      academicYear: academicYear || 'Current',
      term: term || 'Current',
      teacherMetrics: teacherAttendanceData,
      studentMetrics: studentPerformanceData,
      goals: departmentMetrics ? departmentMetrics.goals : [],
      metrics: departmentMetrics ? departmentMetrics.metrics : {},
      generatedAt: new Date(),
      generatedBy: req.user.id
    };
    
    res.json(performanceReport);
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get department attendance metrics
exports.getDepartmentAttendance = async (req, res) => {
  try {
    const { academicYear, term } = req.query;
    
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
    
    if (teachers.length === 0) {
      return res.status(404).json({ message: 'No teachers found in this department' });
    }
    
    // Get attendance data for all teachers in the department
    const attendanceData = await calculateTeacherAttendance(teachers, academicYear, term);
    
    // Get student attendance data if needed
    // This would require additional implementation based on your data model
    
    const attendanceReport = {
      departmentName: department.name,
      academicYear: academicYear || 'Current',
      term: term || 'Current',
      teacherAttendance: attendanceData,
      generatedAt: new Date(),
      generatedBy: req.user.id
    };
    
    res.json(attendanceReport);
  } catch (error) {
    console.error('Error fetching department attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};