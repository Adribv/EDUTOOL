const TeacherLeaveRequest = require('../../../models/Staff/HOD/teacherLeaveRequest.model.js');
const Staff = require('../../../models/Staff/staffModel.js');
const ApprovalRequest = require('../../../models/Staff/HOD/approvalRequest.model.js');

// Submit a new leave request
exports.submitLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, attachmentUrl } = req.body;
    const teacherId = req.user.id;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        message: 'Leave type, start date, end date, and reason are required' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    if (start < new Date()) {
      return res.status(400).json({ 
        message: 'Start date cannot be in the past' 
      });
    }

    // Create new leave request
    const leaveRequest = new TeacherLeaveRequest({
      teacherId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      attachmentUrl,
      status: 'Pending'
    });

    await leaveRequest.save();

    // Populate teacher details for response
    await leaveRequest.populate('teacherId', 'name email');

    // Create ApprovalRequest for principal
    const teacher = await Staff.findById(teacherId);
    const approvalRequest = new ApprovalRequest({
      requesterId: teacherId,
      requesterName: teacher?.name || 'Teacher',
      requestType: 'Leave',
      title: 'Teacher Leave Request',
      description: `Leave Type: ${leaveType}\nReason: ${reason}\nFrom: ${start.toDateString()} To: ${end.toDateString()}`,
      requestData: {
        leaveRequestId: leaveRequest._id,
        leaveType,
        startDate: start,
        endDate: end,
        reason,
        teacherId,
        teacherName: teacher?.name || '',
        attachmentUrl
      },
      status: 'Pending',
      currentApprover: 'Principal',
      approvalHistory: []
    });
    await approvalRequest.save();

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest
    });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teacher's own leave requests
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const leaveRequests = await TeacherLeaveRequest.find({ teacherId })
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific leave request by ID (teacher can only view their own)
exports.getLeaveRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const teacherId = req.user.id;

    const leaveRequest = await TeacherLeaveRequest.findOne({
      _id: requestId,
      teacherId
    }).populate('processedBy', 'name');

    if (!leaveRequest) {
      return res.status(404).json({ 
        message: 'Leave request not found or you are not authorized to view it' 
      });
    }

    res.json(leaveRequest);
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a pending leave request (teacher can only cancel their own pending requests)
exports.cancelLeaveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const teacherId = req.user.id;

    const leaveRequest = await TeacherLeaveRequest.findOne({
      _id: requestId,
      teacherId
    });

    if (!leaveRequest) {
      return res.status(404).json({ 
        message: 'Leave request not found or you are not authorized to cancel it' 
      });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ 
        message: 'Only pending leave requests can be cancelled' 
      });
    }

    leaveRequest.status = 'Cancelled';
    await leaveRequest.save();

    res.json({
      message: 'Leave request cancelled successfully',
      leaveRequest
    });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leave request statistics for teacher
exports.getLeaveStatistics = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const stats = await TeacherLeaveRequest.aggregate([
      { $match: { teacherId: teacherId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statistics = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      statistics[stat._id.toLowerCase()] = stat.count;
      statistics.total += stat.count;
    });

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching leave statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 