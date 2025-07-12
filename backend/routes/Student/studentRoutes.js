const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

// Import controllers
const studentAuth = require('../../controllers/Student/studentAuth');
const profileController = require('../../controllers/Student/profileController');
const academicDashboardController = require('../../controllers/Student/academicDashboardController');
const feeController = require('../../controllers/Student/feeController');
const communicationController = require('../../controllers/Student/communicationController');
const homeworkController = require('../../controllers/Student/homeworkController');
const documentController = require('../../controllers/Student/documentController');
const attendanceController = require('../../controllers/Student/attendanceController');
const examinationController = require('../../controllers/Student/examinationController');
const learningResourcesController = require('../../controllers/Student/learningResourcesController');
const passwordLookupController = require('../../controllers/Student/passwordLookupController');
const mcqController = require('../../controllers/Student/mcqController');

// Auth routes
router.post('/login', studentAuth.login);
router.post('/register', studentAuth.register);

// Apply middleware to all routes below
router.use(verifyToken, permit('Student'));

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

// Academic Dashboard routes
router.get('/timetable', academicDashboardController.getTimetable);
router.get('/subjects', academicDashboardController.getSubjectsAndTeachers);

// Assignment routes with file upload support
router.get('/assignments', academicDashboardController.getAssignments);
router.get('/assignments/:assignmentId', academicDashboardController.getAssignmentDetails);
router.post('/assignments/:assignmentId/submit', upload.single('file'), academicDashboardController.submitAssignment);
router.get('/submissions/:submissionId', academicDashboardController.getSubmissionFeedback);

// Attendance routes
router.get('/attendance', attendanceController.getAttendance);
router.post('/leave-requests', attendanceController.requestLeave);
router.get('/leave-requests', attendanceController.getLeaveRequests);

// Examination routes
router.get('/exams/upcoming', examinationController.getUpcomingExams);
router.get('/exams/:examId/admit-card', examinationController.getAdmitCard);
router.get('/exam-results', examinationController.getExamResults);
router.get('/report-cards', examinationController.getReportCards);
router.get('/performance-analytics', examinationController.getPerformanceAnalytics);

// Fee Management routes
router.get('/fee-structure', feeController.getFeeStructure);
router.get('/payment-status', feeController.getPaymentStatus);
router.get('/payment-receipts/:paymentId', feeController.getPaymentReceipt);
router.post('/payments', feeController.makePayment);

// Learning Resources routes
router.get('/learning-resources', learningResourcesController.getLearningResources);
router.get('/learning-resources/:resourceId', learningResourcesController.getResourceDetails);

// Lesson Plan access
router.get('/lesson-plans', learningResourcesController.getLearningResources);
router.get('/lesson-plans/:resourceId', learningResourcesController.getResourceDetails);

// Communication routes
router.get('/announcements', communicationController.getAnnouncements);
router.get('/messages', communicationController.getMessages);
router.get('/messages/:messageId', communicationController.getMessageDetails);
router.post('/messages/:messageId/reply', communicationController.sendMessageReply);
router.get('/class-discussions', communicationController.getClassDiscussions);
router.get('/class-discussions/:discussionId', communicationController.getDiscussionDetails);
router.post('/class-discussions/:discussionId/comments', communicationController.postDiscussionComment);

// Homework routes
router.get('/homework', homeworkController.getHomework);
router.get('/homework/:homeworkId', homeworkController.getHomeworkDetails);
router.post('/homework/:homeworkId/submit', upload.single('file'), homeworkController.submitHomework);
router.get('/homework-submissions', homeworkController.getHomeworkSubmissions);

// Document routes
router.get('/documents', documentController.getDocuments);

// MCQ Assignment routes
router.get('/mcq-assignments', mcqController.getMCQAssignments);
router.get('/mcq-assignments/:assignmentId', mcqController.getMCQAssignmentById);
router.post('/mcq-assignments/:assignmentId/start', mcqController.startMCQAssignment);
router.post('/mcq-assignments/:assignmentId/submit', mcqController.submitMCQAssignment);
router.get('/mcq-assignments/:assignmentId/results', mcqController.getMCQSubmissionResults);

// Password Lookup routes (public routes - no authentication required)
router.post('/password-lookup/request', passwordLookupController.requestPasswordLookup);
router.get('/password-lookup/verify/:resetToken', passwordLookupController.verifyResetToken);
router.post('/password-lookup/reset', passwordLookupController.resetPassword);
router.delete('/password-lookup/cancel/:resetToken', passwordLookupController.cancelPasswordReset);

module.exports = router;