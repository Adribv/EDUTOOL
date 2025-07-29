const Permission = require('../../models/Staff/Permission');
const Staff = require('../../models/Staff/staffModel');

// Get all staff with their permissions
exports.getAllStaffPermissions = async (req, res) => {
  console.log("getAllStaffPermissions");
  try {
    const staffWithPermissions = await Staff.aggregate([
      {
        $lookup: {
          from: 'permissions',
          localField: '_id',
          foreignField: 'staffId',
          as: 'permissions'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          department: 1,
          designation: 1,
          permissions: { $arrayElemAt: ['$permissions', 0] }
        }
      }
    ]);
    res.json({
      success: true,
      data: staffWithPermissions
    });
  } catch (error) {
    console.error('Error fetching staff permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff permissions',
      error: error.message
    });
  }
};

// Get permissions for a specific staff member
exports.getStaffPermissions = async (req, res) => {
  try {
    const { staffId } = req.params;
    let permissions = await Permission.findOne({ staffId, isActive: true })
      .populate('staffId', 'name email department');
    if (!permissions) {
      // Create a default Permission document if not found
      permissions = new Permission({ staffId, roleAssignments: [], isActive: true });
      await permissions.save();
    }
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching staff permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff permissions',
      error: error.message
    });
  }
};

// Restore logic to store assigned roles in the Permission model (permissions modal)
exports.saveStaffRolesAndAccess = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { roleAssignments, department, remarks } = req.body;
    let permission = await Permission.findOne({ staffId, isActive: true });
    if (!permission) {
      permission = new Permission({ staffId, roleAssignments, department, remarks, isActive: true });
    } else {
      permission.roleAssignments = roleAssignments;
      permission.department = department;
      permission.remarks = remarks;
    }
    await permission.save();
    res.json({ success: true, data: permission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save roles and access', error: error.message });
  }
};

// Get available roles and their default permissions
exports.getAvailableRoles = async (req, res) => {
  try {
    const roles = [
      'Admin',
      'Principal', 
      'Vice Principal',
      'HOD',
      'Teacher',
      'Accountant',
      'Librarian',
      'Wellness Counsellor',
      'IT Support',
      'Office Manager',
      'Facility Manager',
      'Support Staff'
    ];

    const departments = [
      'Academics',
      'Administration', 
      'Support Staff',
      'IT',
      'Library',
      'Wellness',
      'Finance'
    ];

    const rolePermissions = {};
    roles.forEach(role => {
      rolePermissions[role] = Permission.getDefaultPermissions(role);
    });

    res.json({
      success: true,
      data: {
        roles,
        departments,
        defaultPermissions: rolePermissions
      }
    });
  } catch (error) {
    console.error('Error fetching available roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available roles',
      error: error.message
    });
  }
};

// Remove permissions for a staff member
exports.removeStaffPermissions = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const permissions = await Permission.findOneAndUpdate(
      { staffId, isActive: true },
      { isActive: false },
      { new: true }
    );
    
    if (!permissions) {
      return res.status(404).json({
        success: false,
        message: 'Permissions not found for this staff member'
      });
    }

    res.json({
      success: true,
      message: 'Permissions removed successfully'
    });
  } catch (error) {
    console.error('Error removing permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove permissions',
      error: error.message
    });
  }
};

// Get permission summary by role
exports.getPermissionSummary = async (req, res) => {
  try {
    const summary = await Permission.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          departments: { $addToSet: '$department' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching permission summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permission summary',
      error: error.message
    });
  }
};

// Bulk assign role assignments
exports.bulkAssignPermissions = async (req, res) => {
  try {
    const { assignments } = req.body; // Array of { staffId, roleAssignments, department, remarks }
    const assignedBy = req.user?.id || null;
    const results = [];
    for (const assignment of assignments) {
      try {
        const { staffId, roleAssignments, department, remarks } = assignment;
        let existingPermissions = await Permission.findOne({ staffId, isActive: true });
        if (existingPermissions) {
          existingPermissions.roleAssignments = roleAssignments || [];
          existingPermissions.department = department || existingPermissions.department;
          existingPermissions.remarks = remarks || existingPermissions.remarks;
          if (assignedBy) existingPermissions.assignedBy = assignedBy;
          existingPermissions.lastModified = new Date();
          await existingPermissions.save();
          results.push({ staffId, success: true, permissions: existingPermissions });
        } else {
          const newPermissions = new Permission({
            staffId,
            roleAssignments: roleAssignments || [],
            department,
            remarks: remarks || '',
            assignedBy,
            isActive: true
          });
          await newPermissions.save();
          results.push({ staffId, success: true, permissions: newPermissions });
        }
      } catch (error) {
        results.push({ staffId: assignment.staffId, success: false, error: error.message });
      }
    }
    res.json({
      success: true,
      message: 'Bulk assignment completed',
      results
    });
  } catch (error) {
    console.error('Error in bulk assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete bulk assignment',
      error: error.message
    });
  }
};

// Middleware to check permissions
exports.checkPermission = (module, requiredAccess = 'View Access') => {
  return async (req, res, next) => {
    try {
      const staffId = req.user.id;
      
      const permissions = await Permission.findOne({ staffId, isActive: true });
      
      if (!permissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions found for this user'
        });
      }

      const userAccess = permissions.permissions[module];
      
      if (!userAccess || userAccess === 'No Access') {
        return res.status(403).json({
          success: false,
          message: `Access denied to ${module} module`
        });
      }

      if (requiredAccess === 'Edit Access' && userAccess !== 'Edit Access') {
        return res.status(403).json({
          success: false,
          message: `Edit access required for ${module} module`
        });
      }

      req.userPermissions = permissions;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message
      });
    }
  };
}; 