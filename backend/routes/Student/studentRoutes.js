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
if (attendanceController.getAttendance) {
  router.get('/attendance', attendanceController.getAttendance);
}
if (attendanceController.getAttendanceDetails) {
  router.get('/attendance/:month/:year', attendanceController.getAttendanceDetails);
}
if (attendanceController.requestLeave) {
  router.post('/leave-request', attendanceController.requestLeave);
}
if (attendanceController.getLeaveRequests) {
  router.get('/leave-requests', attendanceController.getLeaveRequests);
}

// Communication routes
router.get('/announcements', communicationController.getAnnouncements);
router.get('/messages', communicationController.getMessages);
router.get('/messages/:messageId', communicationController.getMessageDetails);
router.post('/messages/:messageId/reply', communicationController.sendMessageReply);
router.get('/discussions', communicationController.getClassDiscussions);
if (communicationController.getDiscussionDetails) {
  router.get('/discussions/:discussionId', communicationController.getDiscussionDetails);
}

// Examination routes
if (examinationController.getExams) {
  router.get('/exams', examinationController.getExams);
}
if (examinationController.getExamDetails) {
  router.get('/exams/:examId', examinationController.getExamDetails);
}
if (examinationController.getResults) {
  router.get('/results', examinationController.getResults);
}
if (examinationController.getResultDetails) {
  router.get('/results/:resultId', examinationController.getResultDetails);
}

// Fee routes
if (feeController.getFeeDetails) {
  router.get('/fees', feeController.getFeeDetails);
}
if (feeController.getPaymentHistory) {
  router.get('/fees/history', feeController.getPaymentHistory);
}
if (feeController.getPaymentReceipt) {
  router.get('/fees/receipt/:paymentId', feeController.getPaymentReceipt);
}

// Homework routes
if (homeworkController.getHomework) {
  router.get('/homework', homeworkController.getHomework);
}
if (homeworkController.getHomeworkDetails) {
  router.get('/homework/:homeworkId', homeworkController.getHomeworkDetails);
}
if (homeworkController.submitHomework) {
  router.post('/homework/:homeworkId/submit', homeworkController.submitHomework);
}
if (homeworkController.getHomeworkSubmissions) {
  router.get('/homework-submissions', homeworkController.getHomeworkSubmissions);
}

// Learning Resources routes
router.get('/resources', learningResourcesController.getLearningResources);
router.get('/resources/:resourceId', learningResourcesController.getResourceDetails);

module.exports = router;