const express = require('express');
const router = express.Router();
const departmentController = require('../../../controllers/Staff/VP/departmentController');
const { verifyToken, isVicePrincipal } = require('../../../middlewares/authMiddleware');

// All routes require authentication and Vice Principal role
router.use(verifyToken, isVicePrincipal);

// Department CRUD
router.post('/department', departmentController.createDepartment);
router.get('/department', departmentController.getDepartmentDetails);
router.put('/department', departmentController.updateDepartment);

// Teacher management
router.post('/department/teacher', departmentController.addTeacherToDepartment);
router.delete('/department/teacher/:teacherId', departmentController.removeTeacherFromDepartment);
router.get('/department/teachers', departmentController.getDepartmentTeachers);

// Overview, staff, statistics
router.get('/department/overview', departmentController.getDepartmentOverview);
router.get('/department/staff', departmentController.getDepartmentStaff);
router.get('/department/statistics', departmentController.getDepartmentStatistics);

module.exports = router; 