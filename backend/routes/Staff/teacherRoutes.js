const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');
const upload = require('../../middlewares/uploadMiddleware');
const uploadLessonPlan = require('../../middlewares/uploadLessonPlanMiddleware');
const uploadExamPaper = require('../../middlewares/uploadExamPaperMiddleware');

// Import controllers
const teacherProfileController = require('../../controllers/Staff/Teacher/teacherProfileController');
const classSubjectController = require('../../controllers/Staff/Teacher/classSubjectController');
const timetableController = require('../../controllers/Staff/Teacher/timetableController');
const attendanceController = require('../../controllers/Staff/Teacher/attendanceController');
const assignmentController = require('../../controllers/Staff/Teacher/assignmentController');
const examController = require('../../controllers/Staff/Teacher/examController');
const learningMaterialController = require('../../controllers/Staff/Teacher/learningMaterialController');
const communicationController = require('../../controllers/Staff/Teacher/communicationController');
const studentPerformanceController = require('../../controllers/Staff/Teacher/studentPerformanceController');
const projectActivityController = require('../../controllers/Staff/Teacher/projectActivityController');
const parentInteractionController = require('../../controllers/Staff/Teacher/parentInteractionController');
const feedbackController = require('../../controllers/Staff/Teacher/feedbackController');
const teacherLeaveRequestController = require('../../controllers/Staff/Teacher/teacherLeaveRequestController');
const mcqAssignmentController = require('../../controllers/Staff/Teacher/mcqAssignmentController');

// Apply auth middleware to all routes
router.use(verifyToken, permit('Teacher'));

// 1. Personal Profile Management
router.get('/profile', teacherProfileController.getProfile);
router.put('/profile', teacherProfileController.updateProfile);
router.post('/profile/professional-development', upload.single('document'), teacherProfileController.addProfessionalDevelopment);

// 2. Class and Subject Management
router.get('/classes', classSubjectController.getAssignedClasses);
router.get('/classes/:class/:section/students', classSubjectController.getStudentRoster);
router.post('/chapter-plans', classSubjectController.createChapterPlan);
router.get('/chapter-plans/:class/:section/:subject', classSubjectController.getChapterPlans);

// 3. Timetable and Scheduling
router.get('/timetable', timetableController.getTimetable);
router.post('/substitution-requests', timetableController.requestSubstitution);
router.get('/substitution-requests', timetableController.getSubstitutionRequests);
router.get('/academic-calendar', timetableController.getAcademicCalendar);

// Calendar Events (placeholder routes - implement controllers as needed)
router.get('/calendar-events', (req, res) => {
  res.json([]); // Placeholder - implement actual calendar events logic
});
router.post('/events', (req, res) => {
  res.json({ message: 'Event created successfully' }); // Placeholder
});
router.put('/events/:id', (req, res) => {
  res.json({ message: 'Event updated successfully' }); // Placeholder
});
router.delete('/events/:id', (req, res) => {
  res.json({ message: 'Event deleted successfully' }); // Placeholder
});

// 4. Attendance Management
router.post('/attendance', attendanceController.markAttendance);
router.get('/attendance/:class/:section/:date', attendanceController.getAttendance);
router.get('/attendance-report/:class/:section/:startDate/:endDate', attendanceController.generateAttendanceReport);
router.get('/students/:class/:section', attendanceController.getStudentsByClass);

// 5. Assignment and Homework Module
router.post('/assignments', assignmentController.createAssignment);
router.get('/assignments', assignmentController.getAssignments);
router.get('/assignments/:assignmentId', assignmentController.getAssignmentDetails);
router.put('/assignments/:assignmentId', assignmentController.updateAssignment);
router.delete('/assignments/:assignmentId', assignmentController.deleteAssignment);
router.get('/assignments/:assignmentId/submissions', assignmentController.getSubmissions);
router.put('/submissions/:submissionId/grade', assignmentController.gradeSubmission);

// 6. Examination and Assessment
router.post('/exams', uploadExamPaper.single('questionPaper'), examController.createExam);
router.get('/exams', examController.getExams);
router.get('/vp-exams', examController.getVPScheduledExams);
router.post('/exams/:examId/results', examController.enterExamResults);
router.get('/exams/:examId/performance-report', examController.generatePerformanceReport);

// 7. Learning Material Repository
router.post('/lesson-plans', uploadLessonPlan.single('file'), learningMaterialController.submitLessonPlan);
router.get('/lesson-plans', learningMaterialController.getLessonPlans);
router.post('/resources', upload.single('file'), learningMaterialController.uploadResource);
router.get('/resources', learningMaterialController.getResources);
router.get('/departmental-resources', learningMaterialController.getDepartmentalResources);

// 8. Communication Tools
router.post('/messages', upload.array('attachments', 5), communicationController.sendMessage);
router.get('/messages/received', communicationController.getReceivedMessages);
router.get('/messages/sent', communicationController.getSentMessages);
router.post('/announcements', upload.array('attachments', 5), communicationController.postAnnouncement);
router.get('/announcements', communicationController.getAnnouncements);
router.post('/meetings', communicationController.scheduleMeeting);
router.get('/meetings', communicationController.getMeetings);

// 9. Student Performance Tracking
router.post('/student-performance', studentPerformanceController.recordPerformance);
// Fix: Split into two routes instead of using optional parameter
router.get('/student-performance/:studentId', studentPerformanceController.getStudentPerformance);
router.get('/student-performance/:studentId/subject/:subject', studentPerformanceController.getStudentPerformance);
router.post('/student-performance/:studentId/observations', studentPerformanceController.addBehavioralObservation);
router.post('/student-performance/:studentId/intervention-plan', studentPerformanceController.createInterventionPlan);

// 10. Project and Activity Management
router.post('/projects', upload.single('attachment'), projectActivityController.createProject);
router.get('/projects', projectActivityController.getProjects);
router.get('/projects/:projectId', projectActivityController.getProjectDetails);
router.put('/projects/:projectId', upload.single('attachment'), projectActivityController.updateProject);
router.post('/projects/:projectId/student-contributions', projectActivityController.recordStudentContribution);
router.get('/projects/:projectId/student-contributions', projectActivityController.getStudentContributions);
router.post('/extracurricular-achievements', upload.single('certificate'), projectActivityController.recordExtracurricularAchievement);

// 11. Parent Interaction Management
router.get('/parent-meetings', parentInteractionController.getParentMeetings);
router.post('/parent-communications', parentInteractionController.recordCommunication);
router.get('/parent-communications/:parentId', parentInteractionController.getCommunicationHistory);
router.post('/parent-concerns', parentInteractionController.documentConcern);
router.put('/parent-concerns/:concernId/follow-up', parentInteractionController.addFollowUp);
router.post('/progress-updates', upload.single('attachment'), parentInteractionController.sendProgressUpdate);

// 12. Feedback System
router.post('/academic-suggestions', feedbackController.submitSuggestion);
router.post('/resource-requests', feedbackController.requestResource);
router.get('/resource-requests', feedbackController.getResourceRequests);
router.post('/curriculum-feedback', feedbackController.provideCurriculumFeedback);
router.get('/curriculum-feedback', feedbackController.getCurriculumFeedback);

// 13. Teacher Leave Request Management
router.post('/leave-requests', teacherLeaveRequestController.submitLeaveRequest);
router.get('/leave-requests', teacherLeaveRequestController.getMyLeaveRequests);
router.get('/leave-requests/:requestId', teacherLeaveRequestController.getLeaveRequestById);
router.put('/leave-requests/:requestId/cancel', teacherLeaveRequestController.cancelLeaveRequest);
router.get('/leave-requests/stats/statistics', teacherLeaveRequestController.getLeaveStatistics);

// 14. MCQ Assignment Management
router.post('/mcq-assignments', mcqAssignmentController.createMCQAssignment);
router.get('/mcq-assignments', mcqAssignmentController.getMCQAssignments);
router.get('/mcq-assignments/:assignmentId', mcqAssignmentController.getMCQAssignmentById);
router.put('/mcq-assignments/:assignmentId', mcqAssignmentController.updateMCQAssignment);
router.delete('/mcq-assignments/:assignmentId', mcqAssignmentController.deleteMCQAssignment);
router.get('/mcq-assignments/:assignmentId/submissions', mcqAssignmentController.getMCQSubmissions);

module.exports = router;