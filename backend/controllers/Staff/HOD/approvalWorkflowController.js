const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');
const ApprovalRequest = require('../../../models/Staff/HOD/approvalRequest.model'); // You'll need to create this model

// Get all pending approval requests
exports.getPendingRequests = async (req, res) => {
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
    }, '_id');
    
    const teacherIds = teachers.map(teacher => teacher._id);
    
    // Get pending requests from department teachers
    const pendingRequests = await ApprovalRequest.find({
      requesterId: { $in: teacherIds },
      status: 'Pending',
      currentApprover: 'HOD'
    }).populate('requesterId', 'name email').sort({ createdAt: -1 });
    
    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a request
exports.approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { comments, forwardToVP } = req.body;
    
    const request = await ApprovalRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(request.requesterId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Update request status
    if (forwardToVP) {
      request.status = 'Forwarded';
      request.currentApprover = 'VP';
    } else {
      request.status = 'Approved';
      request.currentApprover = 'Completed';
    }
    
    // Add approval history
    request.approvalHistory.push({
      approver: req.user.id,
      role: 'HOD',
      status: forwardToVP ? 'Forwarded to VP' : 'Approved',
      comments: comments || '',
      timestamp: new Date()
    });
    
    await request.save();
    
    res.json({ 
      message: forwardToVP ? 'Request forwarded to Vice Principal' : 'Request approved successfully', 
      request 
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a request
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { comments } = req.body;
    
    const request = await ApprovalRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(request.requesterId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Update request status
    request.status = 'Rejected';
    request.currentApprover = 'Completed';
    
    // Add approval history
    request.approvalHistory.push({
      approver: req.user.id,
      role: 'HOD',
      status: 'Rejected',
      comments: comments || '',
      timestamp: new Date()
    });
    
    await request.save();
    
    res.json({ message: 'Request rejected', request });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all requests (with optional filters)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }, '_id');
    
    const teacherIds = teachers.map(teacher => teacher._id);
    
    // Build query
    const query = {
      requesterId: { $in: teacherIds }
    };
    
    if (status) query.status = status;
    if (type) query.requestType = type;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const requests = await ApprovalRequest.find(query)
      .populate('requesterId', 'name email')
      .populate('approvalHistory.approver', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get approval history for a specific request
exports.getRequestHistory = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await ApprovalRequest.findById(requestId)
      .populate('requesterId', 'name email')
      .populate('approvalHistory.approver', 'name role');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(request.requesterId._id)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    res.json({
      requestId: request._id,
      requester: {
        id: request.requesterId._id,
        name: request.requesterId.name,
        email: request.requesterId.email
      },
      requestType: request.requestType,
      title: request.title,
      description: request.description,
      status: request.status,
      currentApprover: request.currentApprover,
      createdAt: request.createdAt,
      approvalHistory: request.approvalHistory
    });
  } catch (error) {
    console.error('Error fetching request history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};