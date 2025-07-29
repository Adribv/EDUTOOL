const express = require('express');
const router = express.Router();
const permissionsController = require('../../controllers/Admin/permissionsController');
const softSkillsController = require('../../controllers/Admin/softSkillsController');
const supportStaffController = require('../../controllers/Admin/supportStaffController');
const transportController = require('../../controllers/Admin/transportController');
const auditLogController = require('../../controllers/Admin/auditLogController');
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

// Remove all old permissions routes
// Add new minimal permissions route
router.put('/permissions/:staffId', permissionsController.saveStaffRolesAndAccess);

// Get all staff permissions (for admin dashboard)
router.get('/permissions', permissionsController.getAllStaffPermissions);

// Get permissions for a specific staff member
router.get('/permissions/:staffId', permissionsController.getStaffPermissions);

router.post('/softskills/events', softSkillsController.createEvent);
router.get('/softskills/events', softSkillsController.getAllEvents);
router.put('/softskills/events/:id', softSkillsController.updateEvent);
router.delete('/softskills/events/:id', softSkillsController.deleteEvent);
router.post('/softskills/events/:id/participant', softSkillsController.addParticipant);
router.delete('/softskills/events/:id/participant', softSkillsController.removeParticipant);
router.post('/softskills/skill-log', softSkillsController.logSkill);
router.get('/softskills/skill-logs', softSkillsController.getAllSkillLogs);
router.get('/softskills/achievements', softSkillsController.getAllAchievements);

router.get('/support-staff/all', supportStaffController.getAllSupportStaff);
router.post('/support-staff', supportStaffController.createSupportStaff);
router.put('/support-staff/:id', supportStaffController.updateSupportStaff);
router.delete('/support-staff/:id', supportStaffController.deleteSupportStaff);
router.post('/support-staff/:id/task', supportStaffController.addStaffLog);
router.get('/support-staff/logs', supportStaffController.getAllStaffLogs);

router.get('/transport/all', transportController.getAllTransports);
router.post('/transport', transportController.createTransport);
router.put('/transport/:id', transportController.updateTransport);
router.delete('/transport/:id', transportController.deleteTransport);
router.post('/transport/:id/schedule', transportController.addSchedule);
router.post('/transport/:id/fuel-log', transportController.addFuelLog);
router.post('/transport/:id/incident', transportController.addDriverIncident);
router.get('/transport/logs', transportController.getAllLogs);

// Audit Log routes
router.get('/audit-logs', verifyToken, auditLogController.getAllAuditLogs);
router.get('/audit-logs/:id', verifyToken, auditLogController.getAuditLogById);
router.post('/audit-logs', verifyToken, auditLogController.createAuditLog);
router.put('/audit-logs/:id', verifyToken, auditLogController.updateAuditLog);
router.delete('/audit-logs/:id', verifyToken, auditLogController.deleteAuditLog);

module.exports = router; 