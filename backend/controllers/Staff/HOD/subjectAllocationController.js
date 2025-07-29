const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');

// Allocate subject to teacher
exports.allocateSubject = async (req, res) => {
  try {
    const { teacherId, class: cls, section, subject } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if subject is offered by department
    if (!department.subjects.includes(subject)) {
      return res.status(400).json({ message: 'Subject not offered by department' });
    }
    
    // Verify teacher exists and is a teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(teacherId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Add subject to teacher's assigned subjects
    if (!teacher.assignedSubjects) {
      teacher.assignedSubjects = [];
    }
    
    // Check if teacher is already assigned this subject for this class and section
    const alreadyAssigned = teacher.assignedSubjects.some(
      item => item.class === cls && item.section === section && item.subject === subject
    );
    
    if (alreadyAssigned) {
      return res.status(400).json({ message: 'Teacher already assigned to this subject for this class and section' });
    }
    
    teacher.assignedSubjects.push({ class: cls, section, subject });
    await teacher.save();
    
    res.json({ message: 'Subject allocated successfully', teacher });
  } catch (error) {
    console.error('Error allocating subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Deallocate subject from teacher
exports.deallocateSubject = async (req, res) => {
  try {
    const { teacherId, class: cls, section, subject } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Verify teacher exists and is a teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(teacherId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Remove subject from teacher's assigned subjects
    if (!teacher.assignedSubjects) {
      return res.status(400).json({ message: 'Teacher has no assigned subjects' });
    }
    
    const initialLength = teacher.assignedSubjects.length;
    teacher.assignedSubjects = teacher.assignedSubjects.filter(
      item => !(item.class === cls && item.section === section && item.subject === subject)
    );
    
    if (teacher.assignedSubjects.length === initialLength) {
      return res.status(400).json({ message: 'Teacher is not assigned to this subject for this class and section' });
    }
    
    await teacher.save();
    
    res.json({ message: 'Subject deallocated successfully', teacher });
  } catch (error) {
    console.error('Error deallocating subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subject allocations for all teachers in department
exports.getSubjectAllocations = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department with their assigned subjects
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }, 'name email assignedSubjects');
    
    const allocations = teachers.map(teacher => ({
      teacherId: teacher._id,
      name: teacher.name,
      email: teacher.email,
      assignedSubjects: teacher.assignedSubjects || []
    }));
    
    res.json(allocations);
  } catch (error) {
    console.error('Error fetching subject allocations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teachers assigned to a specific subject
exports.getTeachersBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if subject is offered by department
    if (!department.subjects.includes(subject)) {
      return res.status(400).json({ message: 'Subject not offered by department' });
    }
    
    // Find teachers who teach this subject
    const teachers = await Staff.find({
      _id: { $in: department.teachers },
      role: 'Teacher',
      'assignedSubjects.subject': subject
    }, 'name email assignedSubjects');
    
    const filteredTeachers = teachers.map(teacher => ({
      teacherId: teacher._id,
      name: teacher.name,
      email: teacher.email,
      classes: teacher.assignedSubjects
        .filter(item => item.subject === subject)
        .map(item => ({ class: item.class, section: item.section }))
    }));
    
    res.json(filteredTeachers);
  } catch (error) {
    console.error('Error fetching teachers by subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove subject allocation
exports.removeSubjectAllocation = async (req, res) => {
  try {
    const { allocationId } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Parse the allocation ID to get teacher and subject details
    // Format: teacherId-class-section-subject
    const [teacherId, cls, section, subject] = allocationId.split('-');
    
    if (!teacherId || !cls || !section || !subject) {
      return res.status(400).json({ 
        message: 'Invalid allocation ID format. Expected: teacherId-class-section-subject' 
      });
    }
    
    // Verify teacher exists and is a teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(teacherId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Remove subject from teacher's assigned subjects
    if (!teacher.assignedSubjects) {
      return res.status(400).json({ message: 'Teacher has no assigned subjects' });
    }
    
    const initialLength = teacher.assignedSubjects.length;
    teacher.assignedSubjects = teacher.assignedSubjects.filter(
      item => !(item.class === cls && item.section === section && item.subject === subject)
    );
    
    if (teacher.assignedSubjects.length === initialLength) {
      return res.status(400).json({ message: 'Teacher is not assigned to this subject for this class and section' });
    }
    
    await teacher.save();
    
    res.json({ 
      message: 'Subject allocation removed successfully', 
      teacher: {
        id: teacher._id,
        name: teacher.name,
        remainingAllocations: teacher.assignedSubjects.length
      }
    });
  } catch (error) {
    console.error('Error removing subject allocation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};