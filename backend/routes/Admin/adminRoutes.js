const express = require('express');
const router = express.Router();
const permissionsController = require('../../controllers/Admin/permissionsController');
const { verifyToken } = require('../../middlewares/authMiddleware');

// Test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin permissions API is working!',
    timestamp: new Date().toISOString()
  });
});

// Test staff data endpoint (no auth required for testing)
router.get('/test-staff', (req, res) => {
  const sampleStaff = [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'John Smith',
      email: 'john.smith@school.edu',
      role: 'Teacher',
      department: 'Mathematics',
      designation: 'Senior Teacher',
      permissions: {
        role: 'Teacher',
        permissions: {
          students: 'View Access',
          attendance: 'Edit Access',
          assignments: 'Edit Access'
        }
      }
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.edu',
      role: 'Librarian',
      department: 'Library',
      designation: 'Head Librarian',
      permissions: {
        role: 'Librarian',
        permissions: {
          library: 'Edit Access',
          inventory: 'Edit Access'
        }
      }
    },
    {
      _id: '507f1f77bcf86cd799439013',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@school.edu',
      role: 'Principal',
      department: 'Administration',
      designation: 'Principal',
      permissions: {
        role: 'Principal',
        permissions: {
          students: 'Edit Access',
          teachers: 'Edit Access',
          staff: 'Edit Access'
        }
      }
    }
  ];

  res.json({
    success: true,
    data: sampleStaff,
    message: 'Sample staff data for testing'
  });
});

// Permissions management routes - simplified for testing
router.get('/permissions/staff', verifyToken, permissionsController.getAllStaffPermissions);
router.get('/permissions/roles', verifyToken, permissionsController.getAvailableRoles);
router.get('/permissions/summary', verifyToken, permissionsController.getPermissionSummary);
router.get('/permissions/:staffId', verifyToken, permissionsController.getStaffPermissions);
router.post('/permissions/:staffId/assign', verifyToken, permissionsController.assignRoleAndPermissions);
router.put('/permissions/:staffId', verifyToken, permissionsController.updateStaffPermissions);
router.delete('/permissions/:staffId', verifyToken, permissionsController.removeStaffPermissions);
router.post('/permissions/bulk-assign', verifyToken, permissionsController.bulkAssignPermissions);

module.exports = router; 