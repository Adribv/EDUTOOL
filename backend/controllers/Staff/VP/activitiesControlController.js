const ActivitiesControl = require('../../../models/Staff/ActivitiesControl');
const Staff = require('../../../models/Staff/staffModel');

// Get all staff with their activities control assignments
exports.getAllStaffActivities = async (req, res) => {
  try {
    console.log('📋 VP requesting all staff activities control');
    
    const staffWithActivities = await Staff.aggregate([
      {
        $lookup: {
          from: 'activitiescontrols',
          localField: '_id',
          foreignField: 'staffId',
          as: 'activitiesControl'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          department: 1,
          designation: 1,
          status: 1,
          activitiesControl: { $arrayElemAt: ['$activitiesControl', 0] }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    // Normalize the data
    const normalizedStaff = staffWithActivities.map(staff => ({
      ...staff,
      department: typeof staff.department === 'object' && staff.department !== null
        ? staff.department.name
        : staff.department || '',
      designation: typeof staff.designation === 'object' && staff.designation !== null
        ? staff.designation.name
        : staff.designation || '',
      activityAssignments: staff.activitiesControl?.activityAssignments || [],
      remarks: staff.activitiesControl?.remarks || '',
      assignedDate: staff.activitiesControl?.assignedDate || null,
      lastModified: staff.activitiesControl?.lastModified || null
    }));

    res.json({
      success: true,
      data: normalizedStaff
    });
  } catch (error) {
    console.error('❌ Error fetching staff activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff activities',
      error: error.message
    });
  }
};

// Get activities control for a specific staff member
exports.getStaffActivities = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    let activitiesControl = await ActivitiesControl.findOne({ 
      staffId, 
      isActive: true 
    }).populate('staffId', 'name email role department designation');
    
    if (!activitiesControl) {
      // Create a default activities control document if not found
      activitiesControl = new ActivitiesControl({ 
        staffId, 
        assignedBy: req.user.id,
        activityAssignments: [],
        isActive: true 
      });
      await activitiesControl.save();
    }
    
    res.json({
      success: true,
      data: activitiesControl
    });
  } catch (error) {
    console.error('❌ Error fetching staff activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff activities',
      error: error.message
    });
  }
};

// Get activities control for the current logged-in staff member
exports.getMyActivities = async (req, res) => {
  try {
    const staffId = req.user.id; // Get the current user's ID from the token
    
    console.log(`🔍 Staff member ${req.user.email} requesting their own activities control`);
    
    let activitiesControl = await ActivitiesControl.findOne({ 
      staffId, 
      isActive: true 
    }).populate('staffId', 'name email role department designation');
    
    if (!activitiesControl) {
      console.log(`📋 No activities control found for ${req.user.email}, returning null`);
      return res.json({
        success: true,
        data: null // Return null instead of creating a default document
      });
    }
    
    console.log(`✅ Activities control found for ${req.user.email}:`, {
      activityAssignments: activitiesControl.activityAssignments?.length || 0,
      availableActivities: activitiesControl.activityAssignments?.filter(a => a.accessLevel !== 'Unauthorized').map(a => a.activity) || []
    });
    
    res.json({
      success: true,
      data: activitiesControl
    });
  } catch (error) {
    console.error(`❌ Error fetching activities control for ${req.user?.email}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your activities control',
      error: error.message
    });
  }
};

// Save/update activities control for a staff member
exports.saveStaffActivities = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { activityAssignments, department, remarks } = req.body;
    
    // Validate staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    // Find existing activities control or create new one
    let activitiesControl = await ActivitiesControl.findOne({ 
      staffId, 
      isActive: true 
    });
    
    if (!activitiesControl) {
      activitiesControl = new ActivitiesControl({
        staffId,
        assignedBy: req.user.id,
        activityAssignments: [],
        isActive: true
      });
    }
    
    // Update the activities control
    activitiesControl.activityAssignments = activityAssignments || [];
    activitiesControl.department = department || '';
    activitiesControl.remarks = remarks || '';
    activitiesControl.assignedBy = req.user.id;
    
    await activitiesControl.save();
    
    // Populate staff details for response
    await activitiesControl.populate('staffId', 'name email role department designation');
    
    res.json({
      success: true,
      message: 'Activities control saved successfully',
      data: activitiesControl
    });
  } catch (error) {
    console.error('❌ Error saving staff activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save activities control',
      error: error.message
    });
  }
};

// Get available activities
exports.getAvailableActivities = async (req, res) => {
  try {
    const activities = ActivitiesControl.getAvailableActivities();
    
    // Group activities by category
    const groupedActivities = {
      'Admin Activities': [
        'Staff Management',
        'Student Records', 
        'Fee Management',
        'Inventory',
        'Events',
        'Communications',
        'Classes',
        'System Settings',
        'User Management',
        'Permissions',
        'Reports',
        'Enquiries',
        'Visitors',
        'Service Requests',
        'Syllabus Completion',
        'Salary Payroll'
      ],
      'Teacher Activities': [
        'Classes',
        'Assignments',
        'Calendar',
        'Substitute Teacher Request',
        'My Substitute Requests',
        'Teacher Remarks',
        'Counselling Request Form'
      ],
      'Student Activities': [
        'Courses',
        'Student Assignments',
        'Student Calendar',
        'Student Counselling Request Form'
      ],
      'Principal Activities': [
        'Principal Staff Management',
        'Principal Student Management',
        'School Management',
        'Academic Management',
        'Principal Approvals',
        'Principal Reports'
      ],
      'HOD Activities': [
        'Department Management',
        'HOD Staff Management',
        'Course Management',
        'HOD Reports',
        'Lesson Plan Approvals'
      ],
      'Counsellor Activities': [
        'Counselling Requests'
      ],
      'IT Admin Activities': [
        'IT User Management',
        'IT Reports',
        'IT System Settings'
      ]
    };
    
    res.json({
      success: true,
      data: {
        allActivities: activities,
        groupedActivities: groupedActivities
      }
    });
  } catch (error) {
    console.error('❌ Error fetching available activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available activities',
      error: error.message
    });
  }
};

// Bulk assign activities to multiple staff members
exports.bulkAssignActivities = async (req, res) => {
  try {
    const { staffIds, activityAssignments, department, remarks } = req.body;
    
    if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Staff IDs array is required'
      });
    }
    
    const results = [];
    
    for (const staffId of staffIds) {
      try {
        // Validate staff exists
        const staff = await Staff.findById(staffId);
        if (!staff) {
          results.push({
            staffId,
            success: false,
            message: 'Staff member not found'
          });
          continue;
        }
        
        // Find existing activities control or create new one
        let activitiesControl = await ActivitiesControl.findOne({ 
          staffId, 
          isActive: true 
        });
        
        if (!activitiesControl) {
          activitiesControl = new ActivitiesControl({
            staffId,
            assignedBy: req.user.id,
            activityAssignments: [],
            isActive: true
          });
        }
        
        // Update the activities control
        activitiesControl.activityAssignments = activityAssignments || [];
        activitiesControl.department = department || '';
        activitiesControl.remarks = remarks || '';
        activitiesControl.assignedBy = req.user.id;
        
        await activitiesControl.save();
        
        results.push({
          staffId,
          success: true,
          message: 'Activities assigned successfully'
        });
      } catch (error) {
        results.push({
          staffId,
          success: false,
          message: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Bulk assignment completed',
      data: results
    });
  } catch (error) {
    console.error('❌ Error in bulk assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk assignment',
      error: error.message
    });
  }
};

// Get activities control summary/statistics
exports.getActivitiesSummary = async (req, res) => {
  try {
    const [
      totalStaff,
      staffWithActivities,
      activitiesByLevel,
      recentAssignments
    ] = await Promise.all([
      Staff.countDocuments(),
      ActivitiesControl.countDocuments({ isActive: true }),
      ActivitiesControl.aggregate([
        { $unwind: '$activityAssignments' },
        {
          $group: {
            _id: '$activityAssignments.accessLevel',
            count: { $sum: 1 }
          }
        }
      ]),
      ActivitiesControl.find({ isActive: true })
        .populate('staffId', 'name email role')
        .populate('assignedBy', 'name')
        .sort({ lastModified: -1 })
        .limit(10)
    ]);
    
    // Format activities by level
    const levelStats = {
      'Unauthorized': 0,
      'View': 0,
      'Edit': 0,
      'Approve': 0
    };
    
    activitiesByLevel.forEach(level => {
      levelStats[level._id] = level.count;
    });
    
    res.json({
      success: true,
      data: {
        totalStaff,
        staffWithActivities,
        levelStats,
        recentAssignments
      }
    });
  } catch (error) {
    console.error('❌ Error fetching activities summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities summary',
      error: error.message
    });
  }
};

// Delete activities control for a staff member
exports.deleteStaffActivities = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const activitiesControl = await ActivitiesControl.findOne({ 
      staffId, 
      isActive: true 
    });
    
    if (!activitiesControl) {
      return res.status(404).json({
        success: false,
        message: 'Activities control not found for this staff member'
      });
    }
    
    activitiesControl.isActive = false;
    await activitiesControl.save();
    
    res.json({
      success: true,
      message: 'Activities control deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting staff activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activities control',
      error: error.message
    });
  }
}; 