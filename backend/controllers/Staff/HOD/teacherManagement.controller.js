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
    
    // Get all staff in department by department field
    const staff = await Staff.find({ 
      department: department._id
    }).populate('department', 'name');
    
    res.status(200).json({
      success: true,
      message: "Department staff retrieved successfully",
      data: staff
    });
  } catch (error) {
    console.error("Error in getAllTeachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department staff",
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

// Add teacher to department
exports.addTeacher = async (req, res) => {
  try {
    const { name, email, phone, qualification, experience, subjects, status } = req.body;
    
    // Get HOD's department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found for this HOD"
      });
    }
    
    // Create new teacher
    const teacher = new Staff({
      name,
      email,
      phone,
      qualification,
      experience,
      subjects: subjects || [],
      status: status || 'active',
      role: 'Teacher',
      department: department._id
    });
    
    await teacher.save();
    
    // Add teacher to department
    department.teachers.push(teacher._id);
    await department.save();
    
    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      data: teacher
    });
  } catch (error) {
    console.error("Error in addTeacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add teacher",
      error: error.message
    });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updateData = req.body;
    
    // Get HOD's department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found for this HOD"
      });
    }
    
    // Check if teacher belongs to HOD's department
    if (!department.teachers.includes(teacherId)) {
      return res.status(403).json({
        success: false,
        message: "Teacher not found in your department"
      });
    }
    
    // Update teacher
    const teacher = await Staff.findByIdAndUpdate(
      teacherId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher
    });
  } catch (error) {
    console.error("Error in updateTeacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update teacher",
      error: error.message
    });
  }
};

// Delete teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Get HOD's department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found for this HOD"
      });
    }
    
    // Check if teacher belongs to HOD's department
    if (!department.teachers.includes(teacherId)) {
      return res.status(403).json({
        success: false,
        message: "Teacher not found in your department"
      });
    }
    
    // Remove teacher from department
    department.teachers = department.teachers.filter(id => id.toString() !== teacherId);
    await department.save();
    
    // Delete teacher
    await Staff.findByIdAndDelete(teacherId);
    
    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteTeacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete teacher",
      error: error.message
    });
  }
};

// Get teacher attendance
exports.getTeacherAttendance = async (req, res) => {
  try {
    // Get HOD's department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found for this HOD"
      });
    }
    
    // Get all teachers in department with their attendance
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }).populate('attendance');
    
    // Format attendance data
    const attendanceData = teachers.map(teacher => ({
      id: teacher._id,
      teacherName: teacher.name,
      attendance: teacher.attendance || []
    }));
    
    res.status(200).json({
      success: true,
      message: "Teacher attendance retrieved successfully",
      data: attendanceData
    });
  } catch (error) {
    console.error("Error in getTeacherAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher attendance",
      error: error.message
    });
  }
};

// Mark teacher attendance
exports.markAttendance = async (req, res) => {
  try {
    const { teacherId, date, status, timeIn, timeOut, remarks } = req.body;
    
    // Get HOD's department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found for this HOD"
      });
    }
    
    // Check if teacher belongs to HOD's department
    if (!department.teachers.includes(teacherId)) {
      return res.status(403).json({
        success: false,
        message: "Teacher not found in your department"
      });
    }
    
    // Find teacher and update attendance
    const teacher = await Staff.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }
    
    // Initialize attendance array if it doesn't exist
    if (!teacher.attendance) {
      teacher.attendance = [];
    }
    
    // Check if attendance for this date already exists
    const existingAttendanceIndex = teacher.attendance.findIndex(
      a => new Date(a.date).toDateString() === new Date(date).toDateString()
    );
    
    const attendanceRecord = {
      date,
      status,
      timeIn,
      timeOut,
      remarks,
      markedBy: req.user.id,
      markedAt: new Date()
    };
    
    if (existingAttendanceIndex >= 0) {
      // Update existing attendance
      teacher.attendance[existingAttendanceIndex] = attendanceRecord;
    } else {
      // Add new attendance record
      teacher.attendance.push(attendanceRecord);
    }
    
    await teacher.save();
    
    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendanceRecord
    });
  } catch (error) {
    console.error("Error in markAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message
    });
  }
};

// Update teacher attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const updateData = req.body;
    
    // Find teacher with this attendance record
    const teacher = await Staff.findOne({
      'attendance._id': attendanceId
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }
    
    // Get HOD's department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found for this HOD"
      });
    }
    
    // Check if teacher belongs to HOD's department
    if (!department.teachers.includes(teacher._id)) {
      return res.status(403).json({
        success: false,
        message: "Teacher not found in your department"
      });
    }
    
    // Update attendance record
    const attendanceIndex = teacher.attendance.findIndex(
      a => a._id.toString() === attendanceId
    );
    
    if (attendanceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }
    
    teacher.attendance[attendanceIndex] = {
      ...teacher.attendance[attendanceIndex].toObject(),
      ...updateData,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };
    
    await teacher.save();
    
    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: teacher.attendance[attendanceIndex]
    });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message
    });
  }
};

// Get class allocation recommendations based on experience
exports.getClassAllocationRecommendations = async (req, res) => {
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
      role: 'Teacher',
      department: department._id
    });
    
    // Define grade levels and their experience requirements
    const gradeLevels = [
      { grade: 'Grade 1-3', minExperience: 0, maxExperience: 3, priority: 1 },
      { grade: 'Grade 4-6', minExperience: 2, maxExperience: 5, priority: 2 },
      { grade: 'Grade 7-9', minExperience: 4, maxExperience: 8, priority: 3 },
      { grade: 'Grade 10-12', minExperience: 6, maxExperience: 15, priority: 4 }
    ];
    
    // Allocate teachers to grades based on experience
    const allocations = teachers.map(teacher => {
      const experience = parseInt(teacher.experience) || 0;
      
      // Find suitable grade level based on experience
      let recommendedGrade = 'Grade 1-3'; // Default
      let suitabilityScore = 0;
      
      for (const grade of gradeLevels) {
        if (experience >= grade.minExperience && experience <= grade.maxExperience) {
          recommendedGrade = grade.grade;
          suitabilityScore = 100 - Math.abs(experience - (grade.minExperience + grade.maxExperience) / 2) * 10;
          break;
        } else if (experience > grade.maxExperience && grade.priority > gradeLevels.find(g => g.grade === recommendedGrade)?.priority) {
          recommendedGrade = grade.grade;
          suitabilityScore = 80 - (experience - grade.maxExperience) * 5;
        }
      }
      
      return {
        teacherId: teacher._id,
        teacherName: teacher.name,
        experience: experience,
        currentGrade: teacher.assignedClasses?.[0]?.class || 'Not Assigned',
        recommendedGrade: recommendedGrade,
        suitabilityScore: Math.max(0, Math.min(100, suitabilityScore)),
        qualification: teacher.qualification,
        subjects: teacher.subjects || []
      };
    });
    
    // Sort by suitability score (highest first)
    allocations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    
    res.status(200).json({
      success: true,
      message: "Class allocation recommendations generated successfully",
      data: {
        allocations,
        gradeLevels,
        totalTeachers: teachers.length
      }
    });
  } catch (error) {
    console.error("Error in getClassAllocationRecommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate class allocation recommendations",
      error: error.message
    });
  }
};

// Allocate class to teacher
exports.allocateClass = async (req, res) => {
  try {
    const { teacherId, grade, section, academicYear } = req.body;
    
    // Get HOD's department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found for this HOD"
      });
    }
    
    // Find teacher and verify they belong to the department
    const teacher = await Staff.findOne({
      _id: teacherId,
      role: 'Teacher',
      department: department._id
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found in your department"
      });
    }
    
    // Check if class is already assigned to this teacher
    const existingAllocation = teacher.assignedClasses?.find(
      cls => cls.grade === grade && cls.section === section
    );
    
    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        message: "Class already allocated to this teacher"
      });
    }
    
    // Initialize assignedClasses if it doesn't exist
    if (!teacher.assignedClasses) {
      teacher.assignedClasses = [];
    }
    
    // Add class allocation
    teacher.assignedClasses.push({
      grade,
      section,
      academicYear,
      allocatedAt: new Date(),
      allocatedBy: req.user.id
    });
    
    await teacher.save();
    
    res.status(200).json({
      success: true,
      message: "Class allocated successfully",
      data: {
        teacherId: teacher._id,
        teacherName: teacher.name,
        allocatedClass: { grade, section, academicYear }
      }
    });
  } catch (error) {
    console.error("Error in allocateClass:", error);
    res.status(500).json({
      success: false,
      message: "Failed to allocate class",
      error: error.message
    });
  }
};



