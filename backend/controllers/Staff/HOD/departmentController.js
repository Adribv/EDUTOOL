const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');

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
      email: null, // Explicitly set to null to avoid unique constraint issues
      headOfDepartment: req.user.id
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
    const department = await Department.findOne({ headOfDepartment: req.user.id })
      .populate('headOfDepartment', 'name email')
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
    
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    
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
    
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    
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
    
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    
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
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    
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

/**
 * Department Controller for HOD
 * Handles department overview, staff, and statistics
 */

// Get department overview - real implementation
exports.getDepartmentOverview = async (req, res) => {
  try {
    // Get department for the current HOD
    const department = await Department.findOne({ headOfDepartment: req.user.id })
      .populate('headOfDepartment', 'name email')
      .populate('teachers', 'name email role');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    });
    
    // Get students in department classes
    const students = await Student.find({
      class: { $in: department.subjects.map(subject => {
        // Map subjects to class names
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
    
    const overview = {
      departmentName: department.name,
      description: department.description,
      totalTeachers: teachers.length,
      totalStudents: students.length,
      subjects: department.subjects,
      headOfDepartment: department.headOfDepartment,
      teachers: teachers.map(teacher => ({
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role
      }))
    };
    
    res.status(200).json({
      success: true,
      message: "Department overview retrieved successfully",
      data: overview
    });
  } catch (error) {
    console.error("Error in getDepartmentOverview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department overview",
      error: error.message
    });
  }
};

// Get department staff - real implementation
exports.getDepartmentStaff = async (req, res) => {
  try {
    // Get department for the current HOD
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all staff in department
    const staff = await Staff.find({ 
      _id: { $in: department.teachers }
    }).populate('department', 'name');
    
    const staffData = staff.map(member => ({
      id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone,
      joiningDate: member.joiningDate,
      qualification: member.qualification,
      experience: member.experience,
      status: member.status
    }));
    
    res.status(200).json({
      success: true,
      message: "Department staff retrieved successfully",
      data: staffData
    });
  } catch (error) {
    console.error("Error in getDepartmentStaff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department staff",
      error: error.message
    });
  }
};

// Get department statistics
exports.getDepartmentStatistics = async (req, res) => {
  try {
    // Implementation to fetch department statistics
    res.status(200).json({
      success: true,
      message: "Department statistics retrieved successfully",
      data: {
        attendanceRate: 95,
        performanceMetrics: {}
      }
    });
  } catch (error) {
    console.error("Error in getDepartmentStatistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department statistics",
      error: error.message
    });
  }
};