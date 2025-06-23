const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const Student = require('../models/Student/studentModel');
const Parent = require('../models/Parent/parentModel');
const Staff = require('../models/Staff/staffModel');

// Generic Profile Endpoint (used by AuthContext)
router.get('/auth/profile', verifyToken, async (req, res) => {
  try {
    let user;
    
    // Determine user type based on role
    switch (req.user.role) {
      case 'Student':
        user = await Student.findById(req.user.id).select('-password');
        break;
      case 'Parent':
        user = await Parent.findById(req.user.id).select('-password');
        break;
      case 'AdminStaff':
      case 'Teacher':
      case 'HOD':
      case 'Principal':
        user = await Staff.findById(req.user.id).select('-password');
        break;
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.use('/students', require('../routes/Student/studentRoutes'));
router.use('/parents', require('../routes/Parent/parentRoutes'));
router.use('/staffs', require('../routes/Staff/staffRoutes'));

router.use('/teachers', require('../routes/Staff/teacherRoutes'));
// Add HOD routes
router.use('/hod', require('../routes/Staff/hodRoutes'));
router.use('/admin-staff',require('../routes/Staff/Admin/adminStaffRoutes'))

module.exports = router;