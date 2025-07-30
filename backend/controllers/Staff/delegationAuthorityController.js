const DelegationAuthorityNotice = require('../../models/Staff/DelegationAuthorityNotice');
const Staff = require('../../models/Staff/staffModel');
const Department = require('../../models/Staff/HOD/department.model');

// Get all delegation notices
exports.getAllNotices = async (req, res) => {
  try {
    console.log('📋 Fetching all delegation authority notices');
    
    const notices = await DelegationAuthorityNotice.find()
      .populate('delegatorId', 'name email position department')
      .populate('delegateId', 'name email position department')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${notices.length} delegation notices`);
    res.json(notices);
  } catch (error) {
    console.error('❌ Error fetching delegation notices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notice by ID
exports.getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching delegation notice: ${id}`);

    const notice = await DelegationAuthorityNotice.findById(id)
      .populate('delegatorId', 'name email position department')
      .populate('delegateId', 'name email position department')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');

    if (!notice) {
      return res.status(404).json({ message: 'Delegation notice not found' });
    }

    console.log('✅ Delegation notice fetched successfully');
    res.json(notice);
  } catch (error) {
    console.error('❌ Error fetching delegation notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new delegation notice
exports.createNotice = async (req, res) => {
  try {
    console.log('📝 Creating new delegation authority notice');
    console.log('Request body:', req.body);

    const {
      title,
      delegatorName,
      delegatorPosition,
      delegatorDepartment,
      delegateName,
      delegatePosition,
      delegateDepartment,
      delegationType,
      authorityScope,
      responsibilities,
      limitations,
      effectiveDate,
      expiryDate,
      conditions,
      reportingStructure,
      emergencyContact,
      approvalRequired
    } = req.body;

    // Validate required fields
    if (!title || !delegatorName || !delegateName || !delegationType || !authorityScope || !responsibilities || !effectiveDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, delegatorName, delegateName, delegationType, authorityScope, responsibilities, effectiveDate' 
      });
    }



    // Find delegator and delegate staff members
    // First find the department ObjectIds
    const delegatorDept = await Department.findOne({ 
      name: { $regex: new RegExp(delegatorDepartment, 'i') } 
    });
    
    const delegateDept = await Department.findOne({ 
      name: { $regex: new RegExp(delegateDepartment, 'i') } 
    });

    const delegator = await Staff.findOne({ 
      name: { $regex: new RegExp(delegatorName, 'i') },
      department: delegatorDept?._id
    });

    const delegate = await Staff.findOne({ 
      name: { $regex: new RegExp(delegateName, 'i') },
      department: delegateDept?._id
    });

    if (!delegatorDept) {
      return res.status(400).json({ message: `Delegator department '${delegatorDepartment}' not found in the system` });
    }

    if (!delegateDept) {
      return res.status(400).json({ message: `Delegate department '${delegateDepartment}' not found in the system` });
    }

    if (!delegator) {
      return res.status(400).json({ message: `Delegator '${delegatorName}' not found in department '${delegatorDepartment}'` });
    }

    if (!delegate) {
      return res.status(400).json({ message: `Delegate '${delegateName}' not found in department '${delegateDepartment}'` });
    }

    // Create the delegation notice
    const notice = new DelegationAuthorityNotice({
      title,
      delegatorName,
      delegatorPosition,
      delegatorDepartment,
      delegatorId: delegator._id,
      delegateName,
      delegatePosition,
      delegateDepartment,
      delegateId: delegate._id,
      delegationType,
      authorityScope,
      responsibilities,
      limitations,
      effectiveDate: new Date(effectiveDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      conditions,
      reportingStructure,
      emergencyContact,
      approvalRequired: approvalRequired !== false, // Default to true
      status: approvalRequired !== false ? 'Pending' : 'Active',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    // Add initial history entry
    notice.history.push({
      action: 'Created',
      performedBy: req.user.id,
      performedAt: new Date(),
      comments: 'Delegation notice created',
      previousStatus: 'New',
      newStatus: notice.status
    });

    // Add notification for delegate
    notice.notifications.push({
      type: 'Created',
      recipientId: delegate._id,
      message: `You have been assigned delegation authority for: ${title}`,
      sentAt: new Date()
    });

    await notice.save();

    // Populate the saved notice
    const populatedNotice = await DelegationAuthorityNotice.findById(notice._id)
      .populate('delegatorId', 'name email position department')
      .populate('delegateId', 'name email position department')
      .populate('createdBy', 'name email');

    console.log('✅ Delegation notice created successfully');
    res.status(201).json(populatedNotice);
  } catch (error) {
    console.error('❌ Error creating delegation notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delegation notice
exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating delegation notice: ${id}`);

    const notice = await DelegationAuthorityNotice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Delegation notice not found' });
    }

    // Check if notice can be updated (only Draft status can be updated)
    if (notice.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft notices can be updated' });
    }

    // Update fields
    const updateFields = [
      'title', 'delegatorName', 'delegatorPosition', 'delegatorDepartment',
      'delegateName', 'delegatePosition', 'delegateDepartment', 'delegationType',
      'authorityScope', 'responsibilities', 'limitations', 'effectiveDate',
      'expiryDate', 'conditions', 'reportingStructure', 'emergencyContact'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'effectiveDate' || field === 'expiryDate') {
          notice[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          notice[field] = req.body[field];
        }
      }
    });

    notice.updatedBy = req.user.id;

    await notice.save();

    // Populate the updated notice
    const updatedNotice = await DelegationAuthorityNotice.findById(id)
      .populate('delegatorId', 'name email position department')
      .populate('delegateId', 'name email position department')
      .populate('createdBy', 'name email');

    console.log('✅ Delegation notice updated successfully');
    res.json(updatedNotice);
  } catch (error) {
    console.error('❌ Error updating delegation notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete delegation notice
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting delegation notice: ${id}`);

    const notice = await DelegationAuthorityNotice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Delegation notice not found' });
    }

    // Check if notice can be deleted (only Draft status can be deleted)
    if (notice.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft notices can be deleted' });
    }

    await DelegationAuthorityNotice.findByIdAndDelete(id);

    console.log('✅ Delegation notice deleted successfully');
    res.json({ message: 'Delegation notice deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting delegation notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve delegation notice
exports.approveNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, effectiveDate } = req.body;
    console.log(`✅ Approving delegation notice: ${id}`);

    const notice = await DelegationAuthorityNotice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Delegation notice not found' });
    }

    // Check if notice can be approved
    if (!notice.canBeApproved()) {
      return res.status(400).json({ message: 'Notice cannot be approved in its current status' });
    }

    // Approve the notice
    await notice.approve(req.user.id, comments);

    // Update effective date if provided
    if (effectiveDate) {
      notice.effectiveDate = new Date(effectiveDate);
      await notice.save();
    }

    // Populate the approved notice
    const approvedNotice = await DelegationAuthorityNotice.findById(id)
      .populate('delegatorId', 'name email position department')
      .populate('delegateId', 'name email position department')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    console.log('✅ Delegation notice approved successfully');
    res.json(approvedNotice);
  } catch (error) {
    console.error('❌ Error approving delegation notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject delegation notice
exports.rejectNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    console.log(`❌ Rejecting delegation notice: ${id}`);

    const notice = await DelegationAuthorityNotice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Delegation notice not found' });
    }

    // Check if notice can be rejected
    if (!notice.canBeRejected()) {
      return res.status(400).json({ message: 'Notice cannot be rejected in its current status' });
    }

    // Reject the notice
    await notice.reject(req.user.id, comments);

    // Populate the rejected notice
    const rejectedNotice = await DelegationAuthorityNotice.findById(id)
      .populate('delegatorId', 'name email position department')
      .populate('delegateId', 'name email position department')
      .populate('createdBy', 'name email')
      .populate('rejectedBy', 'name email');

    console.log('✅ Delegation notice rejected successfully');
    res.json(rejectedNotice);
  } catch (error) {
    console.error('❌ Error rejecting delegation notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Revoke delegation notice
exports.revokeNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    console.log(`🚫 Revoking delegation notice: ${id}`);

    const notice = await DelegationAuthorityNotice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Delegation notice not found' });
    }

    // Check if notice can be revoked
    if (!notice.canBeRevoked()) {
      return res.status(400).json({ message: 'Notice cannot be revoked in its current status' });
    }

    // Revoke the notice
    await notice.revoke(req.user.id, comments);

    // Populate the revoked notice
    const revokedNotice = await DelegationAuthorityNotice.findById(id)
      .populate('delegatorId', 'name email position department')
      .populate('delegateId', 'name email position department')
      .populate('createdBy', 'name email');

    console.log('✅ Delegation notice revoked successfully');
    res.json(revokedNotice);
  } catch (error) {
    console.error('❌ Error revoking delegation notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending notices for approval
exports.getPendingNotices = async (req, res) => {
  try {
    console.log('⏳ Fetching pending delegation notices for approval');

    const pendingNotices = await DelegationAuthorityNotice.getPendingApprovals();

    console.log(`✅ Found ${pendingNotices.length} pending notices`);
    res.json(pendingNotices);
  } catch (error) {
    console.error('❌ Error fetching pending notices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active delegations
exports.getActiveDelegations = async (req, res) => {
  try {
    console.log('✅ Fetching active delegation notices');

    const activeDelegations = await DelegationAuthorityNotice.getActiveDelegations();

    console.log(`✅ Found ${activeDelegations.length} active delegations`);
    res.json(activeDelegations);
  } catch (error) {
    console.error('❌ Error fetching active delegations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get delegations by staff member
exports.getDelegationsByStaff = async (req, res) => {
  try {
    const { staffId, role } = req.query;
    console.log(`👤 Fetching delegations for staff: ${staffId}, role: ${role}`);

    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }

    const delegations = await DelegationAuthorityNotice.getDelegationsByStaff(staffId, role);

    console.log(`✅ Found ${delegations.length} delegations for staff`);
    res.json(delegations);
  } catch (error) {
    console.error('❌ Error fetching staff delegations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get staff members for delegation
exports.getStaffMembers = async (req, res) => {
  try {
    console.log('👥 Fetching staff members for delegation');

    const staffMembers = await Staff.find({ status: 'active' })
      .select('name email designation department role')
      .populate('department', 'name')
      .sort({ name: 1 });

    console.log(`✅ Found ${staffMembers.length} active staff members`);
    res.json(staffMembers);
  } catch (error) {
    console.error('❌ Error fetching staff members:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get departments
exports.getDepartments = async (req, res) => {
  try {
    console.log('🏢 Fetching departments for delegation');

    const departments = await Department.find()
      .select('name description')
      .sort({ name: 1 });

    console.log(`✅ Found ${departments.length} departments`);
    res.json(departments);
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate PDF for delegation notice
exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📄 Generating PDF for delegation notice: ${id}`);

    const notice = await DelegationAuthorityNotice.findById(id)
      .populate('delegatorId', 'name email position department')
      .populate('delegateId', 'name email position department')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!notice) {
      return res.status(404).json({ message: 'Delegation notice not found' });
    }

    // TODO: Implement PDF generation logic
    // For now, return the notice data
    console.log('✅ PDF generation requested (not implemented yet)');
    res.json({
      message: 'PDF generation feature will be implemented',
      notice: notice
    });
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get delegation statistics
exports.getStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching delegation statistics');

    const [
      totalNotices,
      pendingNotices,
      approvedNotices,
      activeNotices,
      expiredNotices,
      rejectedNotices
    ] = await Promise.all([
      DelegationAuthorityNotice.countDocuments(),
      DelegationAuthorityNotice.countDocuments({ status: 'Pending' }),
      DelegationAuthorityNotice.countDocuments({ status: 'Approved' }),
      DelegationAuthorityNotice.countDocuments({ status: 'Active' }),
      DelegationAuthorityNotice.countDocuments({ status: 'Expired' }),
      DelegationAuthorityNotice.countDocuments({ status: 'Rejected' })
    ]);

    const statistics = {
      total: totalNotices,
      pending: pendingNotices,
      approved: approvedNotices,
      active: activeNotices,
      expired: expiredNotices,
      rejected: rejectedNotices
    };

    console.log('✅ Delegation statistics fetched successfully');
    res.json(statistics);
  } catch (error) {
    console.error('❌ Error fetching delegation statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    console.log(`🔔 Fetching notifications for user: ${req.user.id}`);

    const notices = await DelegationAuthorityNotice.find({
      'notifications.recipientId': req.user.id,
      'notifications.read': false
    })
    .populate('delegatorId', 'name email')
    .populate('delegateId', 'name email')
    .populate('createdBy', 'name email')
    .sort({ 'notifications.sentAt': -1 });

    const notifications = notices.flatMap(notice => 
      notice.notifications
        .filter(notification => 
          notification.recipientId.toString() === req.user.id && 
          !notification.read
        )
        .map(notification => ({
          id: notification._id,
          type: notification.type,
          message: notification.message,
          sentAt: notification.sentAt,
          noticeId: notice._id,
          noticeTitle: notice.title
        }))
    );

    console.log(`✅ Found ${notifications.length} unread notifications`);
    res.json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { noticeId, notificationId } = req.params;
    console.log(`👁️ Marking notification as read: ${notificationId}`);

    const notice = await DelegationAuthorityNotice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: 'Delegation notice not found' });
    }

    const notification = notice.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to mark this notification as read' });
    }

    notification.read = true;
    await notice.save();

    console.log('✅ Notification marked as read successfully');
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 