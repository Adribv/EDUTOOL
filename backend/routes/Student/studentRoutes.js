const express = require('express');
const router = express.Router();

// Import controllers
const academicDashboardController = require('../../controllers/Student/academicDashboardController');
const attendanceController = require('../../controllers/Student/attendanceController');
const communicationController = require('../../controllers/Student/communicationController');
const examinationController = require('../../controllers/Student/examinationController');
const feeController = require('../../controllers/Student/feeController');
const homeworkController = require('../../controllers/Student/homeworkController');
const learningResourcesController = require('../../controllers/Student/learningResourcesController');
const profileController = require('../../controllers/Student/profileController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const studentAuthController = require('../../controllers/Student/studentAuth');
const documentController = require('../../controllers/Student/documentController');

// Public routes (no authentication required)
router.post('/login', studentAuthController.login);
router.post('/register', studentAuthController.register);

// Apply authentication middleware to all routes below this line
router.use(verifyToken);

// Protected routes (authentication required)
// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

// Academic Dashboard routes
router.get('/timetable', academicDashboardController.getTimetable);
router.get('/subjects', academicDashboardController.getSubjectsAndTeachers);
router.get('/assignments', academicDashboardController.getAssignments);
router.post('/assignments/:assignmentId/submit', academicDashboardController.submitAssignment);
router.get('/submissions/:submissionId', academicDashboardController.getSubmissionFeedback);

// Attendance routes
router.get('/attendance', attendanceController.getAttendance);
router.post('/leave-requests', attendanceController.requestLeave);
router.get('/leave-requests', attendanceController.getLeaveRequests);

// Communication routes
router.get('/announcements', communicationController.getAnnouncements);
router.get('/messages', communicationController.getMessages);
router.get('/messages/:messageId', communicationController.getMessageDetails);
router.post('/messages/:messageId/reply', communicationController.sendMessageReply);
router.get('/class-discussions', communicationController.getClassDiscussions);
router.get('/class-discussions/:discussionId', communicationController.getDiscussionDetails);
router.post('/class-discussions/:discussionId/comments', communicationController.postDiscussionComment);

// Examination routes
router.get('/exams/upcoming', examinationController.getUpcomingExams);
router.get('/exams/:examId/admit-card', examinationController.getAdmitCard);
router.get('/exam-results', examinationController.getExamResults);
router.get('/report-cards', examinationController.getReportCards);
router.get('/performance-analytics', examinationController.getPerformanceAnalytics);

// Fee routes
router.get('/fee-structure', feeController.getFeeStructure);
router.get('/payment-status', feeController.getPaymentStatus);
router.get('/payment-receipts/:paymentId', feeController.getPaymentReceipt);

// Homework routes
router.get('/homework', homeworkController.getHomework);
router.get('/homework/:homeworkId', homeworkController.getHomeworkDetails);
router.post('/homework/:homeworkId/submit', homeworkController.submitHomework);
router.get('/homework-submissions', homeworkController.getHomeworkSubmissions);

// Learning Resources routes
router.get('/learning-resources', learningResourcesController.getLearningResources);
router.get('/learning-resources/:resourceId', learningResourcesController.getResourceDetails);

// Documents routes
router.get('/documents', documentController.getDocuments);

module.exports = router;