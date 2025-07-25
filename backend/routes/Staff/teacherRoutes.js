const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/authMiddleware');
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
const ApprovalRequest = require('../../models/Staff/HOD/approvalRequest.model');
const itSupportController = require('../../controllers/Student/itSupportController');

// Apply only authentication middleware to all routes (no role check)
router.use(verifyToken);

// Test route to check if teacher routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Teacher test route called');
  console.log('👤 User:', req.user);
  res.json({ message: 'Teacher routes are working', user: req.user });
});

// 1. Personal Profile Management
router.get('/profile', teacherProfileController.getProfile);
router.put('/profile', teacherProfileController.updateProfile);
router.post('/profile/professional-development', upload.single('document'), teacherProfileController.addProfessionalDevelopment);
router.post('/substitute-requests', teacherProfileController.submitSubstituteRequest);
router.get('/substitute-requests', async (req, res) => {
  try {
    const requests = await ApprovalRequest.find({
      requestType: 'SubstituteTeacherRequest',
      requesterId: req.user.id
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching substitute requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Class and Subject Management
router.get('/classes', classSubjectController.getAssignedClasses);
router.get('/classes/:class/:section/students', classSubjectController.getStudentRoster);
router.post('/chapter-plans', classSubjectController.createChapterPlan);
router.get('/chapter-plans/:class/:section/:subject', classSubjectController.getChapterPlans);

// 3. Timetable and Scheduling
router.get('/timetable', timetableController.getTimetable);
router.post('/timetable', timetableController.addTimetableEntry);
router.put('/timetable/:entryId', timetableController.updateTimetableEntry);
router.delete('/timetable/:entryId', timetableController.deleteTimetableEntry);
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

// NEW: Get all attendance records for a class (optionally filter by section)
router.get('/attendance/:class', attendanceController.getClassAttendance);

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
router.post('/exams/mark-sheet', examController.generateMarkSheet);
router.post('/exams/transcript', examController.generateTranscript);
router.post('/exams/lock-paper', examController.lockExamPaper);
router.post('/exams/moderate-paper', examController.moderateExamPaper);
router.get('/exams/analytics', examController.examAnalytics);
router.get('/exam-timetables', examController.getAllExamTimetables);
router.get('/all-exams', examController.getAllExams);
router.get('/all-exam-papers', examController.getAllExamPapers);
router.get('/all-staff', examController.getAllStaff);
router.put('/exam-timetable/:id', examController.updateExamTimetable);

// 7. Learning Material Repository
router.get('/lesson-plan-options', learningMaterialController.getLessonPlanOptions);
// Allow uploading both the main lesson plan attachment (file) and optional notes PDF
router.post(
  '/lesson-plans',
  uploadLessonPlan.fields([
    { name: 'file', maxCount: 1 },
    { name: 'notes', maxCount: 1 },
  ]),
  learningMaterialController.submitLessonPlan
);
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

// IT Support Request Management (shared for both students and staff)
router.post('/it-support-requests', itSupportController.createITSupportRequest);
router.get('/it-support-requests', itSupportController.getMyITSupportRequests);
router.get('/it-support-requests/stats', itSupportController.getITSupportStats);
router.get('/it-support-requests/:requestId', itSupportController.getITSupportRequestById);
router.put('/it-support-requests/:requestId', itSupportController.updateITSupportRequest);
router.delete('/it-support-requests/:requestId', itSupportController.deleteITSupportRequest);
router.get('/all-it-support-requests', itSupportController.getAllITSupportRequests);

module.exports = router;