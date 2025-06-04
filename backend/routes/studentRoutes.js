const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const studentAuthController = require('../controllers/Student/studentAuth');
const academicDashboardController = require('../controllers/Student/academicDashboardController');
const attendanceController = require('../controllers/Student/attendanceController');
const examinationController = require('../controllers/Student/examinationController');
const feeController = require('../controllers/Student/feeController');
const learningResourcesController = require('../controllers/Student/learningResourcesController');
const communicationController = require('../controllers/Student/communicationController');
const homeworkController = require('../controllers/Student/homeworkController');

// Auth routes
router.post('/login', studentAuthController.login);
router.post('/register', studentAuthController.register);

// Protected routes
router.use(authMiddleware);

// Personal Information Module
router.get('/profile', studentAuthController.getProfile);
router.put('/profile', studentAuthController.updateProfile);

// Academic Dashboard
router.get('/timetable', academicDashboardController.getTimetable);
router.get('/subjects', academicDashboardController.getSubjectsAndTeachers);
router.get('/assignments', academicDashboardController.getAssignments);
router.post('/assignments/:assignmentId/submit', academicDashboardController.submitAssignment);
router.get('/submissions/:submissionId/feedback', academicDashboardController.getSubmissionFeedback);

// Attendance Tracker
router.get('/attendance', attendanceController.getAttendanceRecords);
router.post('/leave-requests', attendanceController.submitLeaveRequest);
router.get('/leave-requests', attendanceController.getLeaveRequests);

// Examination Portal
router.get('/exams/upcoming', examinationController.getUpcomingExams);
router.get('/exams/:examId/admit-card', examinationController.getAdmitCard);
router.get('/exam-results', examinationController.getExamResults);
router.get('/report-cards', examinationController.getReportCards);
router.get('/performance-analytics', examinationController.getPerformanceAnalytics);

// Fee Management
router.get('/fee-structure', feeController.getFeeStructure);
router.get('/payment-status', feeController.getPaymentStatus);
router.get('/payment-receipts/:paymentId', feeController.getPaymentReceipt);

// Learning Resources
router.get('/learning-resources', learningResourcesController.getLearningResources);
router.get('/learning-resources/:resourceId', learningResourcesController.getResourceDetails);

// Communication Center
router.get('/announcements', communicationController.getAnnouncements);
router.get('/messages', communicationController.getMessages);
router.get('/messages/:messageId', communicationController.getMessageDetails);
router.post('/messages/:messageId/reply', communicationController.sendMessageReply);
router.get('/class-discussions', communicationController.getClassDiscussions);
router.get('/class-discussions/:discussionId', communicationController.getDiscussionDetails);
router.post('/class-discussions/:discussionId/comments', communicationController.postDiscussionComment);

// Homework Management
router.get('/homework', homeworkController.getHomework);
router.get('/homework/:homeworkId', homeworkController.getHomeworkDetails);
router.post('/homework/:homeworkId/submit', homeworkController.submitHomework);
router.get('/homework-submissions', homeworkController.getHomeworkSubmissions);

module.exports = router;