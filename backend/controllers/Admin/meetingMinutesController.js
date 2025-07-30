const MeetingMinutes = require('../../models/Admin/MeetingMinutes');
const Staff = require('../../models/Staff/staffModel');

// Get all meeting minutes with pagination and filtering
exports.getAllMeetingMinutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, meetingType, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { meetingTitle: { $regex: search, $options: 'i' } },
        { chairperson: { $regex: search, $options: 'i' } },
        { meetingNumber: { $regex: search, $options: 'i' } },
        { recorder: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by approval status
    if (status) {
      query.approvalStatus = status;
    }
    
    // Filter by meeting type
    if (meetingType) {
      query.meetingType = meetingType;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.meetingDate = {};
      if (startDate) query.meetingDate.$gte = new Date(startDate);
      if (endDate) query.meetingDate.$lte = new Date(endDate);
    }
    
    const meetingMinutes = await MeetingMinutes.find(query)
      .populate('createdBy', 'name email role')
      .populate('lastModifiedBy', 'name email role')
      .populate('vpApproval.approvedBy', 'name email role')
      .populate('principalApproval.approvedBy', 'name email role')
      .sort({ meetingDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MeetingMinutes.countDocuments(query);

    res.json({
      meetingMinutes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching meeting minutes:', error);
    res.status(500).json({ message: 'Error fetching meeting minutes' });
  }
};

// Get meeting minutes by ID
exports.getMeetingMinutesById = async (req, res) => {
  try {
    const meetingMinutes = await MeetingMinutes.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('lastModifiedBy', 'name email role')
      .populate('vpApproval.approvedBy', 'name email role')
      .populate('principalApproval.approvedBy', 'name email role');
    
    if (!meetingMinutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    res.json(meetingMinutes);
  } catch (error) {
    console.error('Error fetching meeting minutes:', error);
    res.status(500).json({ message: 'Error fetching meeting minutes' });
  }
};

// Create new meeting minutes (Admin and AdminStaff only)
exports.createMeetingMinutes = async (req, res) => {
  try {
    // Generate unique meeting number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of meetings for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const todayMeetings = await MeetingMinutes.countDocuments({
      meetingDate: { $gte: todayStart, $lt: todayEnd }
    });
    
    const meetingNumber = `MM-${year}${month}${day}-${String(todayMeetings + 1).padStart(3, '0')}`;
    
    const meetingData = {
      ...req.body,
      meetingNumber,
      createdBy: req.user.id
    };
    
    const meetingMinutes = new MeetingMinutes(meetingData);
    await meetingMinutes.save();
    
    const populatedMeetingMinutes = await MeetingMinutes.findById(meetingMinutes._id)
      .populate('createdBy', 'name email role');
    
    res.status(201).json(populatedMeetingMinutes);
  } catch (error) {
    console.error('Error creating meeting minutes:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Meeting number already exists' });
    }
    res.status(500).json({ message: 'Error creating meeting minutes' });
  }
};

// Update meeting minutes (Admin, VP, Principal can edit based on status)
exports.updateMeetingMinutes = async (req, res) => {
  try {
    const meetingMinutes = await MeetingMinutes.findById(req.params.id);
    
    if (!meetingMinutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    // Check permissions based on user role and current status
    const userRole = req.user.role;
    const currentStatus = meetingMinutes.approvalStatus;
    
    // Admin and AdminStaff can edit if status is Draft or Submitted
    if ((userRole === 'Admin' || userRole === 'AdminStaff') && !['Draft', 'Submitted'].includes(currentStatus)) {
      return res.status(403).json({ message: 'Cannot edit meeting minutes in current status' });
    }
    
    // VP can edit if status is Submitted or VP Approved
    if (userRole === 'VP' && !['Submitted', 'VP Approved'].includes(currentStatus)) {
      return res.status(403).json({ message: 'Cannot edit meeting minutes in current status' });
    }
    
    // Principal can edit if status is VP Approved or Principal Approved
    if (userRole === 'Principal' && !['VP Approved', 'Principal Approved'].includes(currentStatus)) {
      return res.status(403).json({ message: 'Cannot edit meeting minutes in current status' });
    }
    
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date()
    };
    
    const updatedMeetingMinutes = await MeetingMinutes.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role')
     .populate('vpApproval.approvedBy', 'name email role')
     .populate('principalApproval.approvedBy', 'name email role');
    
    res.json(updatedMeetingMinutes);
  } catch (error) {
    console.error('Error updating meeting minutes:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Meeting number already exists' });
    }
    res.status(500).json({ message: 'Error updating meeting minutes' });
  }
};

// Submit meeting minutes for approval (Admin and AdminStaff only)
exports.submitMeetingMinutes = async (req, res) => {
  try {
    const meetingMinutes = await MeetingMinutes.findById(req.params.id);
    
    if (!meetingMinutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    if (meetingMinutes.approvalStatus !== 'Draft') {
      return res.status(400).json({ message: 'Only draft meeting minutes can be submitted' });
    }
    
    const updatedMeetingMinutes = await MeetingMinutes.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'Submitted',
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');
    
    res.json(updatedMeetingMinutes);
  } catch (error) {
    console.error('Error submitting meeting minutes:', error);
    res.status(500).json({ message: 'Error submitting meeting minutes' });
  }
};

// VP Approval (VP only)
exports.vpApproveMeetingMinutes = async (req, res) => {
  try {
    const { remarks } = req.body;
    
    const meetingMinutes = await MeetingMinutes.findById(req.params.id);
    
    if (!meetingMinutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    if (meetingMinutes.approvalStatus !== 'Submitted') {
      return res.status(400).json({ message: 'Only submitted meeting minutes can be approved by VP' });
    }
    
    const updatedMeetingMinutes = await MeetingMinutes.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'VP Approved',
        vpApproval: {
          approvedBy: req.user.id,
          approvedAt: new Date(),
          remarks: remarks || ''
        },
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role')
     .populate('vpApproval.approvedBy', 'name email role');
    
    res.json(updatedMeetingMinutes);
  } catch (error) {
    console.error('Error approving meeting minutes:', error);
    res.status(500).json({ message: 'Error approving meeting minutes' });
  }
};

// Principal Approval (Principal only)
exports.principalApproveMeetingMinutes = async (req, res) => {
  try {
    const { remarks } = req.body;
    
    const meetingMinutes = await MeetingMinutes.findById(req.params.id);
    
    if (!meetingMinutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    if (meetingMinutes.approvalStatus !== 'VP Approved') {
      return res.status(400).json({ message: 'Only VP approved meeting minutes can be approved by Principal' });
    }
    
    const updatedMeetingMinutes = await MeetingMinutes.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'Principal Approved',
        principalApproval: {
          approvedBy: req.user.id,
          approvedAt: new Date(),
          remarks: remarks || ''
        },
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role')
     .populate('principalApproval.approvedBy', 'name email role');
    
    res.json(updatedMeetingMinutes);
  } catch (error) {
    console.error('Error approving meeting minutes:', error);
    res.status(500).json({ message: 'Error approving meeting minutes' });
  }
};

// Reject meeting minutes (VP or Principal)
exports.rejectMeetingMinutes = async (req, res) => {
  try {
    const { remarks } = req.body;
    
    const meetingMinutes = await MeetingMinutes.findById(req.params.id);
    
    if (!meetingMinutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    const userRole = req.user.role;
    const currentStatus = meetingMinutes.approvalStatus;
    
    // VP can reject if status is Submitted
    if (userRole === 'VP' && currentStatus !== 'Submitted') {
      return res.status(400).json({ message: 'Cannot reject meeting minutes in current status' });
    }
    
    // Principal can reject if status is VP Approved
    if (userRole === 'Principal' && currentStatus !== 'VP Approved') {
      return res.status(400).json({ message: 'Cannot reject meeting minutes in current status' });
    }
    
    const updatedMeetingMinutes = await MeetingMinutes.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'Rejected',
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');
    
    res.json(updatedMeetingMinutes);
  } catch (error) {
    console.error('Error rejecting meeting minutes:', error);
    res.status(500).json({ message: 'Error rejecting meeting minutes' });
  }
};

// Delete meeting minutes (Admin and AdminStaff only, if status is Draft)
exports.deleteMeetingMinutes = async (req, res) => {
  try {
    const meetingMinutes = await MeetingMinutes.findById(req.params.id);
    
    if (!meetingMinutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    if (meetingMinutes.approvalStatus !== 'Draft') {
      return res.status(400).json({ message: 'Cannot delete meeting minutes that are not in draft status' });
    }
    
    await MeetingMinutes.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Meeting minutes deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting minutes:', error);
    res.status(500).json({ message: 'Error deleting meeting minutes' });
  }
};

// Get meeting minutes statistics
exports.getMeetingMinutesStats = async (req, res) => {
  try {
    const stats = await MeetingMinutes.aggregate([
      {
        $group: {
          _id: null,
          totalMeetings: { $sum: 1 },
          draftCount: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'Draft'] }, 1, 0] }
          },
          submittedCount: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'Submitted'] }, 1, 0] }
          },
          vpApprovedCount: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'VP Approved'] }, 1, 0] }
          },
          principalApprovedCount: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'Principal Approved'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'Rejected'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const typeStats = await MeetingMinutes.aggregate([
      {
        $group: {
          _id: '$meetingType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const monthlyStats = await MeetingMinutes.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$meetingDate' },
            month: { $month: '$meetingDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      overview: stats[0] || {
        totalMeetings: 0,
        draftCount: 0,
        submittedCount: 0,
        vpApprovedCount: 0,
        principalApprovedCount: 0,
        rejectedCount: 0
      },
      typeStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching meeting minutes stats:', error);
    res.status(500).json({ message: 'Error fetching meeting minutes statistics' });
  }
}; 