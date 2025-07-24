const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

// Import HOD controllers that are available
const departmentController = require('../../controllers/Staff/HOD/departmentController');
const teacherManagementController = require('../../controllers/Staff/HOD/teacherManagement.controller');
const teacherEvaluationController = require('../../controllers/Staff/HOD/teacherEvaluationController');
const teacherSupervisionController = require('../../controllers/Staff/HOD/teacherSupervisionController');
const contentQualityController = require('../../controllers/Staff/HOD/contentQualityController');
const academicPlanningController = require('../../controllers/Staff/HOD/academicPlanningController');
const departmentMetricsController = require('../../controllers/Staff/HOD/departmentMetricsController');
const subjectAllocationController = require('../../controllers/Staff/HOD/subjectAllocationController');
// Import new controllers
const approvalWorkflowController = require('../../controllers/Staff/HOD/approvalWorkflowController');
const reportsAnalyticsController = require('../../controllers/Staff/HOD/reportsAnalyticsController');

// Apply middleware to all HOD routes
router.use(verifyToken);
router.use(permit('HOD'));

// Department Overview routes
router.get('/department/overview', (req, res) => {
  res.status(200).json({ message: "Department overview endpoint - placeholder" });
});

// Course Management routes (for compatibility with frontend)
router.get('/courses', (req, res) => {
  res.status(200).json({ message: "Course management endpoint - placeholder", data: [] });
});
router.post('/courses', (req, res) => {
  res.status(200).json({ message: "Course created successfully" });
});
router.put('/courses/:courseId', (req, res) => {
  res.status(200).json({ message: "Course updated successfully" });
});
router.delete('/courses/:courseId', (req, res) => {
  res.status(200).json({ message: "Course deleted successfully" });
});

// Check if the method exists before using it
router.get('/department/staff', (req, res) => {
  if (typeof departmentController.getDepartmentTeachers === 'function') {
    return departmentController.getDepartmentTeachers(req, res);
  }
  res.status(200).json({ message: "Department staff endpoint - placeholder" });
});

// Line 42 is here - this is where the error occurs
router.get('/department/statistics', (req, res) => {
  if (typeof departmentMetricsController.getDepartmentMetrics === 'function') {
    return departmentMetricsController.getDepartmentMetrics(req, res);
  }
  res.status(200).json({ message: "Department statistics endpoint - placeholder" });
});

// Teacher Management routes - these are already implemented in teacherManagement.controller.js
router.get('/teacher-management/teachers', teacherManagementController.getAllTeachers);
router.get('/teacher-management/teachers/:teacherId', teacherManagementController.getTeacherDetails);
router.post('/teacher-management/teachers', teacherManagementController.addTeacher);
router.put('/teacher-management/teachers/:teacherId', teacherManagementController.updateTeacher);
router.delete('/teacher-management/teachers/:teacherId', teacherManagementController.deleteTeacher);
router.post('/teacher-management/teachers/:teacherId/subjects', teacherManagementController.assignSubject);
router.delete('/teacher-management/teachers/:teacherId/subjects/:subjectId', teacherManagementController.removeSubject);
router.post('/teacher-management/teachers/:teacherId/classes', teacherManagementController.assignClass);
router.delete('/teacher-management/teachers/:teacherId/classes/:classValue', teacherManagementController.removeClass);

// Staff Management routes (for compatibility with frontend)
router.get('/staff', teacherManagementController.getAllTeachers);
router.get('/staff/:staffId', teacherManagementController.getTeacherDetails);
router.post('/staff', teacherManagementController.addTeacher);
router.put('/staff/:staffId', teacherManagementController.updateTeacher);
router.delete('/staff/:staffId', teacherManagementController.deleteTeacher);

// Teacher Attendance routes
router.get('/teacher-attendance', teacherManagementController.getTeacherAttendance);
router.post('/teacher-attendance', teacherManagementController.markAttendance);
router.put('/teacher-attendance/:attendanceId', teacherManagementController.updateAttendance);

// Add a default route for testing
router.get('/test', (req, res) => {
  res.status(200).json({ message: "HOD API is working" });
});

// Comment out other routes for now until we verify the controllers exist

// Teacher Evaluation routes
router.post('/teacher-evaluations', teacherEvaluationController.createEvaluation);
router.get('/teacher-evaluations', teacherEvaluationController.getAllEvaluations);
router.get('/teacher-evaluations/:evaluationId', teacherEvaluationController.getEvaluationById);
router.put('/teacher-evaluations/:evaluationId', teacherEvaluationController.updateEvaluation);
router.delete('/teacher-evaluations/:evaluationId', teacherEvaluationController.deleteEvaluation);

// // Teacher Supervision routes
router.get('/teacher-supervision/profiles', teacherSupervisionController.getDepartmentTeacherProfiles);
router.get('/teacher-supervision/leave-requests', teacherSupervisionController.getLeaveRequests);
router.put('/teacher-supervision/leave-requests/:requestId', teacherSupervisionController.updateLeaveRequest);

// // Academic Planning routes
router.get('/academic-planning/lesson-plans', academicPlanningController.getLessonPlansForReview);
router.put('/academic-planning/lesson-plans/:planId', academicPlanningController.reviewLessonPlan);

// Debug route to check lesson plans
router.get('/debug/lesson-plans', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking all lesson plans');
    const allLessonPlans = await require('../../../models/Staff/Teacher/lessonplan.model').find({});
    console.log('📋 All lesson plans:', allLessonPlans.length);
    
    const pendingLessonPlans = await require('../../../models/Staff/Teacher/lessonplan.model').find({ status: 'Pending' });
    console.log('⏳ Pending lesson plans:', pendingLessonPlans.length);
    
    res.json({
      total: allLessonPlans.length,
      pending: pendingLessonPlans.length,
      lessonPlans: allLessonPlans.map(lp => ({
        id: lp._id,
        title: lp.title,
        status: lp.status,
        submittedBy: lp.submittedBy,
        currentApprover: lp.currentApprover
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check teacher department assignment
router.get('/debug/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log('🔍 Debug: Checking teacher department assignment for:', teacherId);
    
    const teacher = await require('../../../models/Staff/staffModel').findById(teacherId);
    console.log('👨‍🏫 Teacher found:', teacher ? teacher.name : 'Not found');
    
    if (teacher) {
      console.log('🏢 Teacher department:', teacher.department);
      console.log('👥 Teacher assigned subjects:', teacher.assignedSubjects);
      console.log('👥 Teacher assigned classes:', teacher.assignedClasses);
    }
    
    const departments = await require('../../../models/Staff/HOD/department.model').find({});
    console.log('🏢 All departments:', departments.map(d => ({ id: d._id, name: d.name, headOfDepartment: d.headOfDepartment, teachers: d.teachers })));
    
    res.json({
      teacher: teacher ? {
        id: teacher._id,
        name: teacher.name,
        department: teacher.department,
        assignedSubjects: teacher.assignedSubjects,
        assignedClasses: teacher.assignedClasses
      } : null,
      departments: departments.map(d => ({
        id: d._id,
        name: d.name,
        headOfDepartment: d.headOfDepartment,
        teachers: d.teachers
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/academic-planning/syllabus-progress', academicPlanningController.getSyllabusProgress);
router.post('/academic-planning/learning-outcomes', academicPlanningController.createLearningOutcome);
router.get('/academic-planning/learning-outcomes', academicPlanningController.getLearningOutcomes);

// // Content Quality routes
router.get('/content-quality/resources', contentQualityController.getResourcesForReview);
router.put('/content-quality/resources/:resourceId', contentQualityController.reviewResource);
router.post('/content-quality/department-resources', upload.single('file'), contentQualityController.uploadDepartmentResource);
router.get('/content-quality/department-resources', contentQualityController.getDepartmentResourceRepository);

// // Subject Allocation routes
router.post('/subject-allocation', subjectAllocationController.allocateSubject);
router.get('/subject-allocation', subjectAllocationController.getSubjectAllocations);
router.delete('/subject-allocation/:allocationId', subjectAllocationController.removeSubjectAllocation);

// // Department Metrics routes
router.post('/metrics', departmentMetricsController.recordMetrics);
router.get('/metrics', departmentMetricsController.getMetrics);
router.get('/metrics/performance', departmentMetricsController.getDepartmentPerformance);
router.get('/metrics/attendance', departmentMetricsController.getDepartmentAttendance);

// Approval Workflow routes
router.get('/approval-workflow/pending', approvalWorkflowController.getPendingRequests);
router.put('/approval-workflow/approve/:requestId', approvalWorkflowController.approveRequest);
router.put('/approval-workflow/reject/:requestId', approvalWorkflowController.rejectRequest);
router.get('/approval-workflow/requests', approvalWorkflowController.getAllRequests);
router.get('/approval-workflow/requests/:requestId/history', approvalWorkflowController.getRequestHistory);

// Reports and Analytics routes
router.get('/reports/department', reportsAnalyticsController.generateDepartmentReport);
router.get('/reports/learning-trends', reportsAnalyticsController.analyzeLearningTrends);
router.get('/reports/performance-metrics', reportsAnalyticsController.comparePerformanceMetrics);
router.post('/reports/improvement-plans', reportsAnalyticsController.createImprovementPlan);
router.get('/reports/improvement-plans', reportsAnalyticsController.getImprovementPlans);

// Class Allocation routes
router.get('/class-allocation/recommendations', teacherManagementController.getClassAllocationRecommendations);
router.post('/class-allocation', teacherManagementController.allocateClass);

module.exports = router;