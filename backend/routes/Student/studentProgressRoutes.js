const express = require('express');
const router = express.Router();
const studentProgressController = require('../../controllers/Student/studentProgressController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Get current student's progress
router.get('/my-progress', verifyToken, permit('Student'), studentProgressController.getMyProgress);

// Get progress analytics for current student
router.get('/my-analytics', verifyToken, permit('Student'), studentProgressController.getProgressAnalytics);

// Submit feedback for progress report
router.post('/feedback/:id', verifyToken, permit('Student', 'Parent'), studentProgressController.submitFeedback);

// Admin/Teacher routes for managing progress reports
router.get('/student/:studentId', verifyToken, permit('Teacher', 'Admin', 'AdminStaff'), studentProgressController.getStudentProgress);

router.get('/analytics/:studentId', verifyToken, permit('Teacher', 'Admin', 'AdminStaff'), studentProgressController.getProgressAnalytics);

router.post('/', verifyToken, permit('Teacher', 'Admin', 'AdminStaff'), studentProgressController.createProgressReport);

router.put('/:id', verifyToken, permit('Teacher', 'Admin', 'AdminStaff'), studentProgressController.updateProgressReport);

router.delete('/:id', verifyToken, permit('Teacher', 'Admin', 'AdminStaff'), studentProgressController.deleteProgressReport);

// Parent routes for accessing child's progress
router.get('/child/:childId', verifyToken, permit('Parent'), studentProgressController.getChildProgress);

module.exports = router; 