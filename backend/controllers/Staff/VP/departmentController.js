const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, subjects } = req.body;
    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }
    const department = new Department({
      name,
      description,
      subjects: subjects || [],
    });
    await department.save();
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get department details
exports.getDepartmentDetails = async (req, res) => {
  try {
    const department = await Department.findOne({ vicePrincipal: req.user.id })
      .populate('vicePrincipal', 'name email')
      .populate('teachers', 'name email');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    console.error('Error fetching department details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update department details
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, subjects } = req.body;
    const department = await Department.findOne({ vicePrincipal: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    if (name) department.name = name;
    if (description) department.description = description;
    if (subjects) department.subjects = subjects;
    department.updatedAt = Date.now();
    await department.save();
    res.json({ message: 'Department updated successfully', department });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add teacher to department
exports.addTeacherToDepartment = async (req, res) => {
  try {
    const { teacherId } = req.body;
    // Verify teacher exists and is a teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const department = await Department.findOne({ vicePrincipal: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    // Check if teacher is already in department
    if (department.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher already in department' });
    }
    department.teachers.push(teacherId);
    await department.save();
    res.json({ message: 'Teacher added to department successfully', department });
  } catch (error) {
    console.error('Error adding teacher to department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove teacher from department
exports.removeTeacherFromDepartment = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const department = await Department.findOne({ vicePrincipal: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    // Check if teacher is in department
    if (!department.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher not in department' });
    }
    department.teachers = department.teachers.filter(id => id.toString() !== teacherId);
    await department.save();
    res.json({ message: 'Teacher removed from department successfully', department });
  } catch (error) {
    console.error('Error removing teacher from department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all teachers in department
exports.getDepartmentTeachers = async (req, res) => {
  try {
    const department = await Department.findOne({ vicePrincipal: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }, 'name email phone joiningDate');
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching department teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Overview, staff, statistics
exports.getDepartmentOverview = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Department overview retrieved successfully',
      data: {
        departmentName: 'Science Department',
        totalTeachers: 12,
        totalStudents: 450,
        subjects: ['Physics', 'Chemistry', 'Biology']
      }
    });
  } catch (error) {
    console.error('Error in getDepartmentOverview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department overview',
      error: error.message
    });
  }
};

exports.getDepartmentStaff = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Department staff retrieved successfully',
      data: []
    });
  } catch (error) {
    console.error('Error in getDepartmentStaff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department staff',
      error: error.message
    });
  }
};

exports.getDepartmentStatistics = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Department statistics retrieved successfully',
      data: {
        attendanceRate: 95,
        performanceMetrics: {}
      }
    });
  } catch (error) {
    console.error('Error in getDepartmentStatistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department statistics',
      error: error.message
    });
  }
}; 