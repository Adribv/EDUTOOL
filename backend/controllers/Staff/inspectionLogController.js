const InspectionLog = require('../../models/Staff/InspectionLog');
const Staff = require('../../models/Staff/staffModel');

// Get all inspection logs with pagination and filtering
exports.getAllInspectionLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, purposeOfVisit, status, startDate, endDate, priority } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (purposeOfVisit) filter.purposeOfVisit = purposeOfVisit;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (startDate || endDate) {
      filter.dateOfInspection = {};
      if (startDate) filter.dateOfInspection.$gte = new Date(startDate);
      if (endDate) filter.dateOfInspection.$lte = new Date(endDate);
    }

    const inspectionLogs = await InspectionLog.find(filter)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ dateOfInspection: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InspectionLog.countDocuments(filter);

    res.json({
      inspectionLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inspection logs:', error);
    res.status(500).json({ message: 'Error fetching inspection logs' });
  }
};

// Get single inspection log by ID
exports.getInspectionLogById = async (req, res) => {
  try {
    const inspectionLog = await InspectionLog.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('lastEditedBy', 'name email role');

    if (!inspectionLog) {
      return res.status(404).json({ message: 'Inspection log not found' });
    }

    res.json(inspectionLog);
  } catch (error) {
    console.error('Error fetching inspection log:', error);
    res.status(500).json({ message: 'Error fetching inspection log' });
  }
};

// Create new inspection log (Admin only)
exports.createInspectionLog = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is Admin
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin staff can create inspection logs' });
    }

    const inspectionLogData = {
      ...req.body,
      createdBy: req.user.id,
      dateOfInspection: req.body.dateOfInspection || new Date()
    };

    const inspectionLog = new InspectionLog(inspectionLogData);
    await inspectionLog.save();

    const populatedInspectionLog = await InspectionLog.findById(inspectionLog._id)
      .populate('createdBy', 'name email role');

    res.status(201).json({
      message: 'Inspection log created successfully',
      inspectionLog: populatedInspectionLog
    });
  } catch (error) {
    console.error('Error creating inspection log:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating inspection log' });
  }
};

// Update inspection log (VP and Principal only)
exports.updateInspectionLog = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is VP or Principal
    if (!['VP', 'Principal'].includes(role)) {
      return res.status(403).json({ message: 'Only VP and Principal can edit inspection logs' });
    }

    const inspectionLog = await InspectionLog.findById(req.params.id);
    if (!inspectionLog) {
      return res.status(404).json({ message: 'Inspection log not found' });
    }

    const updateData = {
      ...req.body,
      lastEditedBy: req.user.id,
      lastEditedAt: new Date()
    };

    const updatedInspectionLog = await InspectionLog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastEditedBy', 'name email role');

    res.json({
      message: 'Inspection log updated successfully',
      inspectionLog: updatedInspectionLog
    });
  } catch (error) {
    console.error('Error updating inspection log:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating inspection log' });
  }
};

// Delete inspection log (Admin only)
exports.deleteInspectionLog = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is Admin
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin staff can delete inspection logs' });
    }

    const inspectionLog = await InspectionLog.findById(req.params.id);
    if (!inspectionLog) {
      return res.status(404).json({ message: 'Inspection log not found' });
    }

    await InspectionLog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Inspection log deleted successfully' });
  } catch (error) {
    console.error('Error deleting inspection log:', error);
    res.status(500).json({ message: 'Error deleting inspection log' });
  }
};

// Get inspection log statistics
exports.getInspectionLogStats = async (req, res) => {
  try {
    const stats = await InspectionLog.aggregate([
      {
        $group: {
          _id: null,
          totalInspections: { $sum: 1 },
          pendingInspections: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          completedInspections: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          followUpRequired: {
            $sum: { $cond: [{ $eq: ['$status', 'Follow-up Required'] }, 1, 0] }
          }
        }
      }
    ]);

    const purposeStats = await InspectionLog.aggregate([
      {
        $group: {
          _id: '$purposeOfVisit',
          count: { $sum: 1 }
        }
      }
    ]);

    const complianceStats = await InspectionLog.aggregate([
      {
        $group: {
          _id: '$complianceStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await InspectionLog.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overall: stats[0] || { totalInspections: 0, pendingInspections: 0, completedInspections: 0, followUpRequired: 0 },
      byPurpose: purposeStats,
      byCompliance: complianceStats,
      byPriority: priorityStats
    });
  } catch (error) {
    console.error('Error fetching inspection log stats:', error);
    res.status(500).json({ message: 'Error fetching inspection log statistics' });
  }
};

// Update inspection log status (VP and Principal only)
exports.updateInspectionLogStatus = async (req, res) => {
  try {
    const { role } = req.user;
    const { status } = req.body;
    
    // Check if user is VP or Principal
    if (!['VP', 'Principal'].includes(role)) {
      return res.status(403).json({ message: 'Only VP and Principal can update inspection log status' });
    }

    if (!['Pending', 'In Progress', 'Completed', 'Follow-up Required'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const inspectionLog = await InspectionLog.findByIdAndUpdate(
      req.params.id,
      {
        status,
        lastEditedBy: req.user.id,
        lastEditedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastEditedBy', 'name email role');

    if (!inspectionLog) {
      return res.status(404).json({ message: 'Inspection log not found' });
    }

    res.json({
      message: 'Inspection log status updated successfully',
      inspectionLog
    });
  } catch (error) {
    console.error('Error updating inspection log status:', error);
    res.status(500).json({ message: 'Error updating inspection log status' });
  }
};

// Get upcoming inspections
exports.getUpcomingInspections = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const upcomingInspections = await InspectionLog.find({
      nextVisitDate: { $gte: new Date() },
      followUpRequired: true
    })
    .populate('createdBy', 'name email')
    .sort({ nextVisitDate: 1 })
    .limit(parseInt(limit));

    res.json(upcomingInspections);
  } catch (error) {
    console.error('Error fetching upcoming inspections:', error);
    res.status(500).json({ message: 'Error fetching upcoming inspections' });
  }
}; 