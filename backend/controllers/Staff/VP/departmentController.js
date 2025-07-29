const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');
const ApprovalRequest = require('../../../models/Staff/HOD/approvalRequest.model');

// Helper function to ensure Vice Principal has a department
const ensureVicePrincipalDepartment = async (vicePrincipalId) => {
  // First, try to find an existing department for this Vice Principal
  let department = await Department.findOne({ vicePrincipal: vicePrincipalId });
  
  if (!department) {
    // If no department exists, try to find an unassigned department
    department = await Department.findOne({ vicePrincipal: { $exists: false } });
    
    if (department) {
      // Assign the unassigned department to this Vice Principal
      department.vicePrincipal = vicePrincipalId;
      await department.save();
    } else {
      // Create a default department for this Vice Principal
      department = new Department({
        name: 'General Department',
        description: 'Default department for Vice Principal',
        subjects: ['General'],
        email: null,
        vicePrincipal: vicePrincipalId
      });
      await department.save();
    }
  }
  
  return department;
};

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
      email: `${name}@gmail.com`, // Explicitly set to null to avoid unique constraint issues
      vicePrincipal: req.user.id // Set the vice principal
    });
    await department.save();
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get department details - now returns all departments
exports.getDepartmentDetails = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('vicePrincipal', 'name email')
      .populate('headOfDepartment', 'name email')
      .populate('teachers', 'name email')
      .sort({ name: 1 });
    
    res.json(departments);
  } catch (error) {
    console.error('Error fetching department details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update department details - now can update any department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subjects } = req.body;
    
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    if (name) department.name = name;
    if (description) department.description = description;
    if (subjects) department.subjects = subjects;
    department.updatedAt = Date.now();
    
    await department.save();
    
    const updatedDepartment = await Department.findById(department._id)
      .populate('vicePrincipal', 'name email')
      .populate('headOfDepartment', 'name email')
      .populate('teachers', 'name email');
    
    res.json({ message: 'Department updated successfully', department: updatedDepartment });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add teacher to department - now can add to any department
exports.addTeacherToDepartment = async (req, res) => {
  try {
    const { departmentId, teacherId } = req.body;
    
    // Verify teacher exists and is a teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher is already in department
    if (department.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher already in department' });
    }
    
    department.teachers.push(teacherId);
    await department.save();
    
    const updatedDepartment = await Department.findById(department._id)
      .populate('vicePrincipal', 'name email')
      .populate('headOfDepartment', 'name email')
      .populate('teachers', 'name email');
    
    res.json({ message: 'Teacher added to department successfully', department: updatedDepartment });
  } catch (error) {
    console.error('Error adding teacher to department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove teacher from department - now can remove from any department
exports.removeTeacherFromDepartment = async (req, res) => {
  try {
    const { departmentId, teacherId } = req.params;
    
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher is in department
    if (!department.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher not in department' });
    }
    
    department.teachers = department.teachers.filter(id => id.toString() !== teacherId);
    await department.save();
    
    const updatedDepartment = await Department.findById(department._id)
      .populate('vicePrincipal', 'name email')
      .populate('headOfDepartment', 'name email')
      .populate('teachers', 'name email');
    
    res.json({ message: 'Teacher removed from department successfully', department: updatedDepartment });
  } catch (error) {
    console.error('Error removing teacher from department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all teachers in department - now can get from any department
exports.getDepartmentTeachers = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const department = await Department.findById(departmentId);
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

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('vicePrincipal', 'name email')
      .populate('headOfDepartment', 'name email')
      .populate('teachers', 'name email');
    
    res.json(departments);
  } catch (error) {
    console.error('Error fetching all departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign HOD to department
exports.assignHODToDepartment = async (req, res) => {
  try {
    const { departmentId, hodId } = req.body;
    
    // Verify the department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Verify the HOD exists and is actually an HOD
    const hod = await Staff.findById(hodId);
    if (!hod || hod.role !== 'HOD') {
      return res.status(404).json({ message: 'HOD not found' });
    }
    
    // Update department with HOD
    department.headOfDepartment = hodId;
    await department.save();
    
    const updatedDepartment = await Department.findById(department._id)
      .populate('vicePrincipal', 'name email')
      .populate('headOfDepartment', 'name email')
      .populate('teachers', 'name email');
    
    res.json({ message: 'HOD assigned successfully', department: updatedDepartment });
  } catch (error) {
    console.error('Error assigning HOD:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all HODs
exports.getAllHODs = async (req, res) => {
  try {
    const hods = await Staff.find({ role: 'HOD' })
      .select('name email contactNumber joiningDate');
    
    // For each HOD, find the department they are assigned to
    const hodsWithDepartments = await Promise.all(
      hods.map(async (hod) => {
        const department = await Department.findOne({ headOfDepartment: hod._id })
          .select('name description');
        
        return {
          ...hod.toObject(),
          department: department || null
        };
      })
    );
    
    res.json(hodsWithDepartments);
  } catch (error) {
    console.error('Error fetching HODs:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// Get all pending service requests for VP
exports.getPendingServiceRequests = async (req, res) => {
  try {
    const requests = await ApprovalRequest.find({
      requestType: { $in: ['ServiceRequest', 'SubstituteTeacherRequest'] },
      currentApprover: 'VP',
      status: 'Pending'
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending service requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a service request (forward to Principal)
exports.approveServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const request = await ApprovalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    if (request.currentApprover !== 'VP' || request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request is not pending VP approval' });
    }
    request.status = 'Pending';
    request.currentApprover = 'Principal';
    request.approvalHistory.push({
      approver: req.user.id,
      role: 'VP',
      status: 'Approved',
      comments: comments || 'Approved by VP',
      timestamp: new Date()
    });
    await request.save();
    res.json({ message: 'Service request approved and forwarded to Principal', request });
  } catch (error) {
    console.error('Error approving service request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a service request
exports.rejectServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const request = await ApprovalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    if (request.currentApprover !== 'VP' || request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request is not pending VP approval' });
    }
    request.status = 'Rejected';
    request.currentApprover = 'Completed';
    request.approvalHistory.push({
      approver: req.user.id,
      role: 'VP',
      status: 'Rejected',
      comments: comments || 'Rejected by VP',
      timestamp: new Date()
    });
    await request.save();
    res.json({ message: 'Service request rejected', request });
  } catch (error) {
    console.error('Error rejecting service request:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 