const InspectionLog = require('../../models/Admin/inspectionLogModel');
const Staff = require('../../models/Staff/staffModel');

// Create new inspection log
const createInspectionLog = async (req, res) => {
  try {
    const {
      dateOfInspection,
      inspectorName,
      designation,
      purposeOfVisit,
      summaryOfObservations,
      recommendationsGiven,
      actionTakenBySchool,
      followUpRequired,
      nextVisitDate
    } = req.body;

    // Check if user is AdminStaff (can create inspection logs)
    if (req.user.role !== 'AdminStaff') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin Staff can create inspection logs'
      });
    }

    const inspectionLog = new InspectionLog({
      dateOfInspection,
      inspectorName,
      designation,
      purposeOfVisit,
      summaryOfObservations,
      recommendationsGiven,
      actionTakenBySchool,
      followUpRequired,
      nextVisitDate,
      createdBy: req.user.id
    });

    await inspectionLog.save();

    // Populate createdBy field
    await inspectionLog.populate('createdBy', 'name email designation');

    res.status(201).json({
      success: true,
      message: 'Inspection log created successfully',
      data: inspectionLog
    });
  } catch (error) {
    console.error('Error creating inspection log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating inspection log',
      error: error.message
    });
  }
};

// Get all inspection logs with filtering and pagination
const getAllInspectionLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      designation,
      purposeOfVisit,
      followUpRequired,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};

    // Apply filters
    if (designation) {
      query.designation = designation;
    }
    if (purposeOfVisit) {
      query.purposeOfVisit = purposeOfVisit;
    }
    if (followUpRequired !== undefined) {
      query.followUpRequired = followUpRequired === 'true';
    }
    if (startDate || endDate) {
      query.dateOfInspection = {};
      if (startDate) {
        query.dateOfInspection.$gte = new Date(startDate);
      }
      if (endDate) {
        query.dateOfInspection.$lte = new Date(endDate);
      }
    }
    if (search) {
      query.$or = [
        { inspectorName: { $regex: search, $options: 'i' } },
        { summaryOfObservations: { $regex: search, $options: 'i' } },
        { recommendationsGiven: { $regex: search, $options: 'i' } }
      ];
    }

    // Check user permissions
    if (req.user.role === 'AdminStaff') {
      // AdminStaff can see all inspection logs
    } else if (req.user.role === 'VP' || req.user.role === 'Principal') {
      // VP and Principal can see all inspection logs
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admin Staff, VP, and Principal can view inspection logs'
      });
    }

    const skip = (page - 1) * limit;
    
    const inspectionLogs = await InspectionLog.find(query)
      .populate('createdBy', 'name email designation')
      .populate('updatedBy', 'name email designation')
      .sort({ dateOfInspection: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InspectionLog.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Inspection logs retrieved successfully',
      data: inspectionLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error retrieving inspection logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspection logs',
      error: error.message
    });
  }
};

// Get single inspection log by ID
const getInspectionLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const inspectionLog = await InspectionLog.findById(id)
      .populate('createdBy', 'name email designation')
      .populate('updatedBy', 'name email designation');

    if (!inspectionLog) {
      return res.status(404).json({
        success: false,
        message: 'Inspection log not found'
      });
    }

    // Check user permissions
    if (req.user.role === 'AdminStaff') {
      // AdminStaff can view all inspection logs
    } else if (req.user.role === 'VP' || req.user.role === 'Principal') {
      // VP and Principal can view all inspection logs
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admin Staff, VP, and Principal can view inspection logs'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inspection log retrieved successfully',
      data: inspectionLog
    });
  } catch (error) {
    console.error('Error retrieving inspection log:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspection log',
      error: error.message
    });
  }
};

// Update inspection log
const updateInspectionLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inspectionLog = await InspectionLog.findById(id);

    if (!inspectionLog) {
      return res.status(404).json({
        success: false,
        message: 'Inspection log not found'
      });
    }

    // Check user permissions for editing
    if (req.user.role === 'AdminStaff') {
      // AdminStaff can edit inspection logs they created
      if (inspectionLog.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit inspection logs you created'
        });
      }
    } else if (req.user.role === 'VP' || req.user.role === 'Principal') {
      // VP and Principal can edit any inspection log
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admin Staff, VP, and Principal can edit inspection logs'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;

    // Add updatedBy field
    updateData.updatedBy = req.user.id;

    const updatedInspectionLog = await InspectionLog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email designation')
      .populate('updatedBy', 'name email designation');

    res.status(200).json({
      success: true,
      message: 'Inspection log updated successfully',
      data: updatedInspectionLog
    });
  } catch (error) {
    console.error('Error updating inspection log:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inspection log',
      error: error.message
    });
  }
};

// Delete inspection log
const deleteInspectionLog = async (req, res) => {
  try {
    const { id } = req.params;

    const inspectionLog = await InspectionLog.findById(id);

    if (!inspectionLog) {
      return res.status(404).json({
        success: false,
        message: 'Inspection log not found'
      });
    }

    // Check user permissions for deletion
    if (req.user.role === 'AdminStaff') {
      // AdminStaff can only delete inspection logs they created
      if (inspectionLog.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete inspection logs you created'
        });
      }
    } else if (req.user.role === 'VP' || req.user.role === 'Principal') {
      // VP and Principal can delete any inspection log
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admin Staff, VP, and Principal can delete inspection logs'
      });
    }

    await InspectionLog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Inspection log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inspection log:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inspection log',
      error: error.message
    });
  }
};



// Get inspection statistics
const getInspectionStatistics = async (req, res) => {
  try {
    // Check user permissions
    if (req.user.role === 'AdminStaff') {
      // AdminStaff can see statistics
    } else if (req.user.role === 'VP' || req.user.role === 'Principal') {
      // VP and Principal can see statistics
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admin Staff, VP, and Principal can view inspection statistics'
      });
    }

    const totalInspections = await InspectionLog.countDocuments();
    const followUpRequired = await InspectionLog.countDocuments({ followUpRequired: true });

    // Get inspections by designation
    const inspectionsByDesignation = await InspectionLog.aggregate([
      {
        $group: {
          _id: '$designation',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get inspections by purpose
    const inspectionsByPurpose = await InspectionLog.aggregate([
      {
        $group: {
          _id: '$purposeOfVisit',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent inspections (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentInspections = await InspectionLog.countDocuments({
      dateOfInspection: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      message: 'Inspection statistics retrieved successfully',
      data: {
        totalInspections,
        followUpRequired,
        recentInspections,
        inspectionsByDesignation,
        inspectionsByPurpose
      }
    });
  } catch (error) {
    console.error('Error retrieving inspection statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspection statistics',
      error: error.message
    });
  }
};

module.exports = {
  createInspectionLog,
  getAllInspectionLogs,
  getInspectionLogById,
  updateInspectionLog,
  deleteInspectionLog,
  getInspectionStatistics
}; 