const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');
const TeacherLeaveRequest = require('../../../models/Staff/HOD/teacherLeaveRequest.model');
const TeacherEvaluation = require('../../../models/Staff/HOD/teacherEvaluation.model');

// Get all teachers in department with complete profiles
exports.getDepartmentTeacherProfiles = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department with their profiles
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }).populate('teacherProfile');
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teacher profiles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Monitor teaching schedules and workload
exports.getTeacherWorkloads = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }, 'name email assignedSubjects');
    
    const workloads = teachers.map(teacher => {
      // Calculate workload based on number of classes and subjects
      const classCount = teacher.assignedSubjects ? teacher.assignedSubjects.length : 0;
      
      // Group by class and section to count unique classes
      const uniqueClasses = new Set();
      if (teacher.assignedSubjects) {
        teacher.assignedSubjects.forEach(item => {
          uniqueClasses.add(`${item.class}-${item.section}`);
        });
      }
      
      return {
        teacherId: teacher._id,
        name: teacher.name,
        email: teacher.email,
        totalSubjects: classCount,
        uniqueClassSections: uniqueClasses.size,
        assignedSubjects: teacher.assignedSubjects || [],
        workloadLevel: classCount > 8 ? 'High' : classCount > 4 ? 'Medium' : 'Low'
      };
    });
    
    res.json(workloads);
  } catch (error) {
    console.error('Error fetching teacher workloads:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Review and process teacher leave requests
exports.getLeaveRequests = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const leaveRequests = await TeacherLeaveRequest.find({
      teacherId: { $in: department.teachers }
    }).populate('teacherId', 'name email').sort({ createdAt: -1 });
    
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process a leave request
exports.processLeaveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comments } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const leaveRequest = await TeacherLeaveRequest.findById(requestId);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(leaveRequest.teacherId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Update request status
    leaveRequest.status = status;
    leaveRequest.hodComments = comments;
    leaveRequest.processedBy = req.user.id;
    leaveRequest.processedAt = new Date();
    
    await leaveRequest.save();
    
    res.json({ message: 'Leave request processed successfully', leaveRequest });
  } catch (error) {
    console.error('Error processing leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reassign classes
exports.reassignClass = async (req, res) => {
  try {
    const { fromTeacherId, toTeacherId, class: cls, section, subject } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if both teachers belong to this department
    if (!department.teachers.includes(fromTeacherId) || !department.teachers.includes(toTeacherId)) {
      return res.status(403).json({ message: 'One or both teachers do not belong to your department' });
    }
    
    // Get both teachers
    const fromTeacher = await Staff.findById(fromTeacherId);
    const toTeacher = await Staff.findById(toTeacherId);
    
    if (!fromTeacher || !toTeacher || fromTeacher.role !== 'Teacher' || toTeacher.role !== 'Teacher') {
      return res.status(404).json({ message: 'One or both teachers not found' });
    }
    
    // Check if from teacher has this class assigned
    const hasClass = fromTeacher.assignedSubjects.some(
      item => item.class === cls && item.section === section && item.subject === subject
    );
    
    if (!hasClass) {
      return res.status(400).json({ message: 'From teacher does not have this class assigned' });
    }
    
    // Check if to teacher already has this class assigned
    const alreadyAssigned = toTeacher.assignedSubjects.some(
      item => item.class === cls && item.section === section && item.subject === subject
    );
    
    if (alreadyAssigned) {
      return res.status(400).json({ message: 'To teacher already has this class assigned' });
    }
    
    // Remove class from fromTeacher
    fromTeacher.assignedSubjects = fromTeacher.assignedSubjects.filter(
      item => !(item.class === cls && item.section === section && item.subject === subject)
    );
    
    // Add class to toTeacher
    if (!toTeacher.assignedSubjects) {
      toTeacher.assignedSubjects = [];
    }
    toTeacher.assignedSubjects.push({ class: cls, section, subject });
    
    // Save both teachers
    await fromTeacher.save();
    await toTeacher.save();
    
    res.json({ 
      message: 'Class reassigned successfully', 
      fromTeacher: { id: fromTeacher._id, name: fromTeacher.name },
      toTeacher: { id: toTeacher._id, name: toTeacher.name }
    });
  } catch (error) {
    console.error('Error reassigning class:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a leave request
exports.updateLeaveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comments } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const leaveRequest = await TeacherLeaveRequest.findById(requestId);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(leaveRequest.teacherId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Update request status
    leaveRequest.status = status || leaveRequest.status;
    leaveRequest.hodComments = comments || leaveRequest.hodComments;
    leaveRequest.updatedAt = new Date();
    
    await leaveRequest.save();
    
    res.json({ message: 'Leave request updated successfully', leaveRequest });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};