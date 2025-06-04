
const Staff = require('../../../models/Staff/staffModel');
const Department = require('../../../models/Staff/HOD/department.model');

exports.getAllTeachers = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    });
    
    res.status(200).json({
      success: true,
      message: "Teachers retrieved successfully",
      data: teachers
    });
  } catch (error) {
    console.error("Error in getAllTeachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message
    });
  }
};

// Get teacher details
exports.getTeacherDetails = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Get teacher details
    const teacher = await Staff.findOne({ 
      _id: teacherId,
      role: 'Teacher'
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Teacher details retrieved successfully",
      data: teacher
    });
  } catch (error) {
    console.error("Error in getTeacherDetails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher details",
      error: error.message
    });
  }
};

// Assign subject to teacher
exports.assignSubject = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { class: cls, section, subject } = req.body;
    
    // Find teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }
    
    // Check if subject already assigned
    const alreadyAssigned = teacher.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "Subject already assigned to this teacher"
      });
    }
    
    // Assign subject
    teacher.assignedSubjects.push({ class: cls, section, subject });
    await teacher.save();
    
    res.status(200).json({
      success: true,
      message: "Subject assigned successfully",
      data: teacher
    });
  } catch (error) {
    console.error("Error in assignSubject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign subject",
      error: error.message
    });
  }
};

// Remove subject from teacher
exports.removeSubject = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;

    // Find teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // Filter out the subject using _id inside assignedSubjects
    const originalLength = teacher.assignedSubjects.length;

    teacher.assignedSubjects = teacher.assignedSubjects.filter(
      (subject) => subject._id.toString() !== subjectId
    );

    // Optional: Check if deletion actually happened
    if (teacher.assignedSubjects.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Subject not found in teacher's assignedSubjects"
      });
    }

    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Subject removed successfully",
      data: { teacherId, subjectId }
    });
  } catch (error) {
    console.error("Error in removeSubject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove subject",
      error: error.message
    });
  }
};


// Assign class to teacher
exports.assignClass = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { class: cls, section } = req.body;
    
    // Find teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }
    
    // Check if class already assigned
    const alreadyAssigned = teacher.assignedClasses && teacher.assignedClasses.some(
      c => c.class === cls && c.section === section
    );
    
    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "Class already assigned to this teacher"
      });
    }
    
    // Initialize assignedClasses if it doesn't exist
    if (!teacher.assignedClasses) {
      teacher.assignedClasses = [];
    }
    
    // Assign class
    teacher.assignedClasses.push({ class: cls, section });
    await teacher.save();
    
    res.status(200).json({
      success: true,
      message: "Class assigned successfully",
      data: teacher
    });
  } catch (error) {
    console.error("Error in assignClass:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign class",
      error: error.message
    });
  }
};

// Remove class from teacher
exports.removeClass = async (req, res) => {
  try {
    const { teacherId, classValue } = req.params;

    // Find teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // Check if assignedSubjects exists
    if (!Array.isArray(teacher.assignedSubjects)) {
      return res.status(404).json({
        success: false,
        message: "No subjects assigned to this teacher"
      });
    }

    const originalLength = teacher.assignedSubjects.length;

    // Filter out subjects matching class value
    teacher.assignedSubjects = teacher.assignedSubjects.filter(
      (item) => item.class !== classValue
    );

    if (teacher.assignedSubjects.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: `Class "${classValue}" not found in assignedSubjects`
      });
    }

    await teacher.save();

    res.status(200).json({
      success: true,
      message: `Subjects with class "${classValue}" removed successfully`,
      data: { teacherId, classValue }
    });
  } catch (error) {
    console.error("Error in removeClass:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove class",
      error: error.message
    });
  }
};



