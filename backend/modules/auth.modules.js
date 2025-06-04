const express = require('express');
const router = express.Router();

router.use('/students', require('../routes/Student/studentRoutes'));
router.use('/parents', require('../routes/Parent/parentRoutes'));
router.use('/staffs', require('../routes/Staff/staffRoutes'));

router.use('/teachers', require('../routes/Staff/teacherRoutes'));
// Add HOD routes
router.use('/hod', require('../routes/Staff/hodRoutes'));
router.use('/admin-staff',require('../routes/Staff/Admin/adminStaffRoutes'))

module.exports = router;