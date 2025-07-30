const AuditLog = require('../../models/Admin/auditLogModel');

// Create new audit log
exports.createAuditLog = async (req, res) => {
  try {
    const {
      dateOfAudit,
      auditType,
      auditorName,
      auditorDesignation,
      scopeOfAudit,
      complianceStatus,
      nonConformitiesIdentified,
      recommendations,
      correctiveActions,
      responsiblePerson,
      targetCompletionDate,
      status
    } = req.body;

    const auditLog = new AuditLog({
      dateOfAudit,
      auditType,
      auditorName,
      auditorDesignation,
      scopeOfAudit,
      complianceStatus,
      nonConformitiesIdentified,
      recommendations,
      correctiveActions,
      responsiblePerson,
      targetCompletionDate,
      status,
      createdBy: req.user.id
    });

    await auditLog.save();
    res.status(201).json({ success: true, data: auditLog });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all audit logs with filtering and pagination
exports.getAllAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      auditType,
      complianceStatus,
      status,
      responsiblePerson,
      startDate,
      endDate,
      search
    } = req.query;

    const filter = {};

    // Apply filters
    if (auditType) filter.auditType = auditType;
    if (complianceStatus) filter.complianceStatus = complianceStatus;
    if (status) filter.status = status;
    if (responsiblePerson) filter.responsiblePerson = { $regex: responsiblePerson, $options: 'i' };

    // Date range filter
    if (startDate || endDate) {
      filter.dateOfAudit = {};
      if (startDate) filter.dateOfAudit.$gte = new Date(startDate);
      if (endDate) filter.dateOfAudit.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { auditorName: { $regex: search, $options: 'i' } },
        { scopeOfAudit: { $regex: search, $options: 'i' } },
        { responsiblePerson: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const auditLogs = await AuditLog.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ dateOfAudit: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: auditLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single audit log by ID
exports.getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!auditLog) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    res.json({ success: true, data: auditLog });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update audit log
exports.updateAuditLog = async (req, res) => {
  try {
    const {
      dateOfAudit,
      auditType,
      auditorName,
      auditorDesignation,
      scopeOfAudit,
      complianceStatus,
      nonConformitiesIdentified,
      recommendations,
      correctiveActions,
      responsiblePerson,
      targetCompletionDate,
      status
    } = req.body;

    const auditLog = await AuditLog.findById(req.params.id);

    if (!auditLog) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    // Update fields
    auditLog.dateOfAudit = dateOfAudit || auditLog.dateOfAudit;
    auditLog.auditType = auditType || auditLog.auditType;
    auditLog.auditorName = auditorName || auditLog.auditorName;
    auditLog.auditorDesignation = auditorDesignation || auditLog.auditorDesignation;
    auditLog.scopeOfAudit = scopeOfAudit || auditLog.scopeOfAudit;
    auditLog.complianceStatus = complianceStatus || auditLog.complianceStatus;
    auditLog.nonConformitiesIdentified = nonConformitiesIdentified !== undefined ? nonConformitiesIdentified : auditLog.nonConformitiesIdentified;
    auditLog.recommendations = recommendations !== undefined ? recommendations : auditLog.recommendations;
    auditLog.correctiveActions = correctiveActions !== undefined ? correctiveActions : auditLog.correctiveActions;
    auditLog.responsiblePerson = responsiblePerson || auditLog.responsiblePerson;
    auditLog.targetCompletionDate = targetCompletionDate || auditLog.targetCompletionDate;
    auditLog.status = status || auditLog.status;
    auditLog.updatedBy = req.user.id;

    await auditLog.save();

    const updatedAuditLog = await AuditLog.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({ success: true, data: updatedAuditLog });
  } catch (error) {
    console.error('Error updating audit log:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete audit log
exports.deleteAuditLog = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id);

    if (!auditLog) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    await AuditLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Audit log deleted successfully' });
  } catch (error) {
    console.error('Error deleting audit log:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit statistics
exports.getAuditStatistics = async (req, res) => {
  try {
    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: null,
          totalAudits: { $sum: 1 },
          compliant: {
            $sum: { $cond: [{ $eq: ['$complianceStatus', 'Compliant'] }, 1, 0] }
          },
          partiallyCompliant: {
            $sum: { $cond: [{ $eq: ['$complianceStatus', 'Partially Compliant'] }, 1, 0] }
          },
          nonCompliant: {
            $sum: { $cond: [{ $eq: ['$complianceStatus', 'Non-Compliant'] }, 1, 0] }
          },
          open: {
            $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          closed: {
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
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalAudits: 0,
          compliant: 0,
          partiallyCompliant: 0,
          nonCompliant: 0,
          open: 0,
          inProgress: 0,
          closed: 0
        },
        auditTypes: auditTypeStats
      }
    });
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 