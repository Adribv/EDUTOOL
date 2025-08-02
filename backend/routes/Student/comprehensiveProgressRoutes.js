const express = require('express');
const router = express.Router();
const comprehensiveProgressController = require('../../controllers/Student/comprehensiveProgressController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Generate comprehensive progress report (Admin/Teacher only)
router.post('/generate', verifyToken, permit('Teacher', 'Admin', 'AdminStaff'), comprehensiveProgressController.generateComprehensiveReport);

// Get comprehensive report for current student
router.get('/my-comprehensive-report', verifyToken, permit('Student'), comprehensiveProgressController.getMyComprehensiveReport);

// Get comprehensive report by ID
router.get('/:id', verifyToken, permit('Student', 'Parent', 'Teacher', 'Admin', 'AdminStaff'), comprehensiveProgressController.getComprehensiveReportById);

// Submit feedback for comprehensive report
router.post('/feedback/:id', verifyToken, permit('Student', 'Parent'), comprehensiveProgressController.submitComprehensiveFeedback);

// Admin/Teacher routes for managing comprehensive reports
router.put('/:id', verifyToken, permit('Teacher', 'Admin', 'AdminStaff'), comprehensiveProgressController.updateComprehensiveReport);

// Parent routes for accessing child's comprehensive report
router.get('/child/:childId/comprehensive-report', verifyToken, permit('Parent'), comprehensiveProgressController.getChildComprehensiveReport);

module.exports = router; 