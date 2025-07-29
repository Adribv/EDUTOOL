const express = require('express');
const router = express.Router();
const departmentController = require('../../../controllers/Staff/VP/departmentController');
const examController = require('../../../controllers/Staff/VP/examController');
const timetableController = require('../../../controllers/Staff/VP/timetableController');
const curriculumController = require('../../../controllers/Staff/VP/curriculumController');
const hodApprovalController = require('../../../controllers/Staff/VP/hodApprovalController');
const profileController = require('../../../controllers/Staff/VP/profileController');
const activitiesControlController = require('../../../controllers/Staff/VP/activitiesControlController');
const { verifyToken, isVicePrincipal } = require('../../../middlewares/authMiddleware');

// All routes require authentication and Vice Principal role
router.use(verifyToken, isVicePrincipal);

// Department CRUD
router.post('/department', departmentController.createDepartment);
router.get('/department', departmentController.getDepartmentDetails);
router.put('/department/:id', departmentController.updateDepartment);
router.get('/departments', departmentController.getAllDepartments);
router.post('/department/hod', departmentController.assignHODToDepartment);
router.get('/hods', departmentController.getAllHODs);

// Teacher management
router.post('/department/teacher', departmentController.addTeacherToDepartment);
router.delete('/department/:departmentId/teacher/:teacherId', departmentController.removeTeacherFromDepartment);
router.get('/department/:departmentId/teachers', departmentController.getDepartmentTeachers);

// Overview, staff, statistics
router.get('/department/overview', departmentController.getDepartmentOverview);
router.get('/department/staff', departmentController.getDepartmentStaff);
router.get('/department/statistics', departmentController.getDepartmentStatistics);

// Exam Management
router.get('/exams', examController.getAllExams);
router.post('/exams', examController.createExam);
router.put('/exams/:id', examController.updateExam);
router.delete('/exams/:id', examController.deleteExam);
router.get('/exams/grade/:grade', examController.getExamsByGrade);

// Timetable Management
router.get('/timetables', timetableController.getAllTimetables);
router.post('/timetables', timetableController.createTimetable);
router.put('/timetables/:id', timetableController.updateTimetable);
router.delete('/timetables/:id', timetableController.deleteTimetable);
router.get('/timetables/grade/:grade', timetableController.getTimetablesByGrade);
router.get('/timetables/date-range', timetableController.getTimetablesByDateRange);

// Curriculum Management
router.get('/curriculum', curriculumController.getAllCurriculumPlans);
router.get('/curriculum/approved', curriculumController.getApprovedCurriculumPlans);
router.post('/curriculum', curriculumController.createCurriculumPlan);
router.put('/curriculum/:id', curriculumController.updateCurriculumPlan);
router.delete('/curriculum/:id', curriculumController.deleteCurriculumPlan);
router.post('/curriculum/:id/approve', curriculumController.approveCurriculumPlan);
router.post('/curriculum/:id/reject', curriculumController.rejectCurriculumPlan);
router.get('/curriculum/grade/:grade', curriculumController.getCurriculumPlansByGrade);
// Add new route for teacher remarks (point 4)
router.get('/curriculum/:id/teacher-remarks', curriculumController.getTeacherRemarksForCurriculum);

// Teacher Management Routes
router.get('/teachers', curriculumController.getAllTeachers);
router.get('/department/:departmentId/teachers', curriculumController.getTeachersByDepartment);

// HOD Approval Management
router.get('/hod-submissions', hodApprovalController.getAllHODSubmissions);
router.get('/hod-submissions/pending', hodApprovalController.getPendingHODSubmissions);
router.post('/hod-submissions/:id/approve', hodApprovalController.approveHODSubmission);
router.post('/hod-submissions/:id/reject', hodApprovalController.rejectHODSubmission);
router.get('/hod-submissions/department/:departmentId', hodApprovalController.getHODSubmissionsByDepartment);
router.get('/hod-submissions/type/:type', hodApprovalController.getHODSubmissionsByType);

// Profile Management
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.post('/change-password', profileController.changePassword);

// Service Request Management
router.get('/service-requests', departmentController.getPendingServiceRequests);
router.post('/service-requests', departmentController.createServiceRequest);
router.post('/service-requests/:id/approve', departmentController.approveServiceRequest);
router.post('/service-requests/:id/reject', departmentController.rejectServiceRequest);

// Activities Control Routes
router.get('/activities-control/staff', activitiesControlController.getAllStaffActivities);
router.get('/activities-control/staff/:staffId', activitiesControlController.getStaffActivities);
router.post('/activities-control/staff/:staffId', activitiesControlController.saveStaffActivities);
router.delete('/activities-control/staff/:staffId', activitiesControlController.deleteStaffActivities);
router.get('/activities-control/activities', activitiesControlController.getAvailableActivities);
router.post('/activities-control/bulk-assign', activitiesControlController.bulkAssignActivities);
router.get('/activities-control/summary', activitiesControlController.getActivitiesSummary);

// HOD Template Management
router.post('/hod-templates', departmentController.createHODTemplate);
router.get('/hod-templates', departmentController.getHODTemplates);

module.exports = router; 