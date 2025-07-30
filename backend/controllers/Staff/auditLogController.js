const AuditLog = require('../../models/Staff/AuditLog');
const Staff = require('../../models/Staff/staffModel');

// Get all audit logs with pagination and filtering
exports.getAllAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, auditType, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (auditType) filter.auditType = auditType;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.dateOfAudit = {};
      if (startDate) filter.dateOfAudit.$gte = new Date(startDate);
      if (endDate) filter.dateOfAudit.$lte = new Date(endDate);
    }

    const auditLogs = await AuditLog.find(filter)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ dateOfAudit: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      auditLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
};

// Get single audit log by ID
exports.getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('lastEditedBy', 'name email role');

    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json(auditLog);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Error fetching audit log' });
  }
};

// Create new audit log (Admin only)
exports.createAuditLog = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is Admin
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin staff can create audit logs' });
    }

    const auditLogData = {
      ...req.body,
      createdBy: req.user.id,
      dateOfAudit: req.body.dateOfAudit || new Date()
    };

    const auditLog = new AuditLog(auditLogData);
    await auditLog.save();

    const populatedAuditLog = await AuditLog.findById(auditLog._id)
      .populate('createdBy', 'name email role');

    res.status(201).json({
      message: 'Audit log created successfully',
      auditLog: populatedAuditLog
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating audit log' });
  }
};

// Update audit log (VP and Principal only)
exports.updateAuditLog = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is VP or Principal
    if (!['VP', 'Principal'].includes(role)) {
      return res.status(403).json({ message: 'Only VP and Principal can edit audit logs' });
    }

    const auditLog = await AuditLog.findById(req.params.id);
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    const updateData = {
      ...req.body,
      lastEditedBy: req.user.id,
      lastEditedAt: new Date()
    };

    const updatedAuditLog = await AuditLog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastEditedBy', 'name email role');

    res.json({
      message: 'Audit log updated successfully',
      auditLog: updatedAuditLog
    });
  } catch (error) {
    console.error('Error updating audit log:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating audit log' });
  }
};

// Delete audit log (Admin only)
exports.deleteAuditLog = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is Admin
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin staff can delete audit logs' });
    }

    const auditLog = await AuditLog.findById(req.params.id);
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    await AuditLog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Audit log deleted successfully' });
  } catch (error) {
    console.error('Error deleting audit log:', error);
    res.status(500).json({ message: 'Error deleting audit log' });
  }
};

// Get audit log statistics
exports.getAuditLogStats = async (req, res) => {
  try {
    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: null,
          totalAudits: { $sum: 1 },
          openAudits: {
            $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] }
          },
          closedAudits: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
          }
        }
      }
    ]);

    const auditTypeStats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$auditType',
          count: { $sum: 1 }
        }
      }
    ]);

    const complianceStats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$complianceStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overall: stats[0] || { totalAudits: 0, openAudits: 0, closedAudits: 0 },
      byType: auditTypeStats,
      byCompliance: complianceStats
    });
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ message: 'Error fetching audit log statistics' });
  }
};

// Update audit log status (VP and Principal only)
exports.updateAuditLogStatus = async (req, res) => {
  try {
    const { role } = req.user;
    const { status } = req.body;
    
    // Check if user is VP or Principal
    if (!['VP', 'Principal'].includes(role)) {
      return res.status(403).json({ message: 'Only VP and Principal can update audit log status' });
    }

    if (!['Open', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Open or Closed' });
    }

    const auditLog = await AuditLog.findByIdAndUpdate(
      req.params.id,
      {
        status,
        lastEditedBy: req.user.id,
        lastEditedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastEditedBy', 'name email role');

    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json({
      message: 'Audit log status updated successfully',
      auditLog
    });
  } catch (error) {
    console.error('Error updating audit log status:', error);
    res.status(500).json({ message: 'Error updating audit log status' });
  }
}; 