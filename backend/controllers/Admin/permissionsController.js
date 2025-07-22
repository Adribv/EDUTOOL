const Permission = require('../../models/Staff/Permission');
const Staff = require('../../models/Staff/staffModel');

// Get all staff with their permissions
exports.getAllStaffPermissions = async (req, res) => {
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
          role: 1,
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
    
    const permissions = await Permission.findOne({ staffId, isActive: true })
      .populate('staffId', 'name email role department');
    
    if (!permissions) {
      return res.status(404).json({
        success: false,
        message: 'Permissions not found for this staff member'
      });
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

// Assign role and permissions to staff
exports.assignRoleAndPermissions = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { role, department, permissions, customPermissions, approvalPermissions } = req.body;
    const assignedBy = req.user.id;

    // Verify staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Get default permissions for the role
    let defaultPermissions = Permission.getDefaultPermissions(role, department);
    
    // Merge with custom permissions if provided
    const finalPermissions = {
      ...defaultPermissions.permissions,
      ...permissions
    };

    // Check if permissions already exist
    let existingPermissions = await Permission.findOne({ staffId, isActive: true });
    
    if (existingPermissions) {
      // Update existing permissions
      existingPermissions.role = role;
      existingPermissions.department = department;
      existingPermissions.permissions = finalPermissions;
      existingPermissions.customPermissions = customPermissions || [];
      existingPermissions.approvalPermissions = approvalPermissions || existingPermissions.approvalPermissions;
      existingPermissions.assignedBy = assignedBy;
      existingPermissions.lastModified = new Date();
      
      await existingPermissions.save();
      
      res.json({
        success: true,
        message: 'Permissions updated successfully',
        data: existingPermissions
      });
    } else {
      // Create new permissions
      const newPermissions = new Permission({
        staffId,
        role,
        department,
        permissions: finalPermissions,
        customPermissions: customPermissions || [],
        approvalPermissions: approvalPermissions || {},
        assignedBy
      });
      
      await newPermissions.save();
      
      res.status(201).json({
        success: true,
        message: 'Role and permissions assigned successfully',
        data: newPermissions
      });
    }

    // Update staff role
    staff.role = role;
    if (department) staff.department = department;
    await staff.save();

  } catch (error) {
    console.error('Error assigning role and permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign role and permissions',
      error: error.message
    });
  }
};

// Update specific permissions for a staff member
exports.updateStaffPermissions = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { permissions, customPermissions, approvalPermissions, role, department, reportingTo, remarks } = req.body;
    const assignedBy = req.user.id;

    let existingPermissions = await Permission.findOne({ staffId, isActive: true });

    if (!existingPermissions) {
      // If not found, create new permissions document (upsert behavior)
      const newPermissions = new Permission({
        staffId,
        role: role || 'Teacher',
        department,
        permissions: permissions || {},
        customPermissions: customPermissions || [],
        approvalPermissions: approvalPermissions || {},
        assignedBy,
        reportingTo: reportingTo || '',
        remarks: remarks || '',
        isActive: true
      });
      await newPermissions.save();
      return res.status(201).json({
        success: true,
        message: 'Permissions created successfully',
        data: newPermissions
      });
    }

    // Update permissions
    if (permissions) {
      existingPermissions.permissions = { ...existingPermissions.permissions, ...permissions };
    }
    if (customPermissions) {
      existingPermissions.customPermissions = customPermissions;
    }
    if (approvalPermissions) {
      existingPermissions.approvalPermissions = { ...existingPermissions.approvalPermissions, ...approvalPermissions };
    }
    if (role) existingPermissions.role = role;
    if (department) existingPermissions.department = department;
    if (reportingTo) existingPermissions.reportingTo = reportingTo;
    if (remarks) existingPermissions.remarks = remarks;
    existingPermissions.assignedBy = assignedBy;
    existingPermissions.lastModified = new Date();

    await existingPermissions.save();

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: existingPermissions
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permissions',
      error: error.message
    });
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

// Bulk assign permissions
exports.bulkAssignPermissions = async (req, res) => {
  try {
    const { assignments } = req.body; // Array of { staffId, role, department, permissions }
    const assignedBy = req.user.id;
    const results = [];

    for (const assignment of assignments) {
      try {
        const { staffId, role, department, permissions } = assignment;
        
        // Get default permissions for the role
        const defaultPermissions = Permission.getDefaultPermissions(role, department);
        const finalPermissions = {
          ...defaultPermissions.permissions,
          ...permissions
        };

        // Update or create permissions
        const updatedPermissions = await Permission.findOneAndUpdate(
          { staffId, isActive: true },
          {
            role,
            department,
            permissions: finalPermissions,
            assignedBy,
            lastModified: new Date()
          },
          { upsert: true, new: true }
        );

        // Update staff role
        await Staff.findByIdAndUpdate(staffId, { role, department });

        results.push({
          staffId,
          success: true,
          permissions: updatedPermissions
        });
      } catch (error) {
        results.push({
          staffId: assignment.staffId,
          success: false,
          error: error.message
        });
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