const express = require('express');
const router = express.Router();
const principalController = require('../../../controllers/Staff/Principal/principalController');
const { verifyToken, isPrincipal } = require('../../../middlewares/authMiddleware');
const expenseController = require('../../../controllers/Finance/expenseController');

// All routes require authentication and Principal role
router.use(verifyToken, isPrincipal);

// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Principal test route called');
  res.json({ message: 'Principal routes are working' });
});

// Dashboard
router.get('/dashboard', principalController.getDashboard);

// Profile Management
router.get('/profile', principalController.getProfile);
router.put('/profile', principalController.updateProfile);
router.put('/profile/password', principalController.updatePassword);
router.post('/profile/image', principalController.uploadProfileImage);

// Approval System
router.get('/approvals', principalController.getPendingApprovals);

router.put('/approvals/:approvalId/approve', principalController.approveRequest);
router.put('/approvals/:approvalId/reject', principalController.rejectRequest);
router.get('/approvals/history', principalController.getApprovalHistory);
router.get('/approvals/all', principalController.getAllApprovals);
router.get('/approvals/:approvalId', principalController.getApprovalDetails);

// Student Management
router.get('/students/attendance', principalController.getStudentAttendance);
router.get('/students/performance', principalController.getStudentPerformance);
router.get('/students', principalController.getAllStudents);
router.get('/students/:studentId', principalController.getStudentDetails);

// Staff Management
router.get('/staff/leave-requests', principalController.getLeaveRequests);
router.get('/staff/performance', principalController.getStaffPerformance);
router.get('/staff', principalController.getStaff);
router.get('/staff/:staffId', principalController.getStaffDetails);
router.put('/staff/leave-requests/:leaveId/approve', principalController.approveLeaveRequest);
router.put('/staff/leave-requests/:leaveId/reject', principalController.rejectLeaveRequest);

// Admissions
router.get('/admissions', principalController.getAdmissions);
router.get('/admissions/:admissionId', principalController.getAdmissionDetails);
router.put('/admissions/:admissionId/approve', principalController.approveAdmission);
router.put('/admissions/:admissionId/reject', principalController.rejectAdmission);
router.put('/admissions/:admissionId/status', principalController.updateAdmissionStatus);

// School Management
router.get('/school', principalController.getSchoolInfo);
router.put('/school', principalController.updateSchoolInfo);

// Department Management
router.get('/departments', principalController.getDepartments);
router.post('/departments', principalController.createDepartment);
router.put('/departments/:departmentId', principalController.updateDepartment);
router.delete('/departments/:departmentId', principalController.deleteDepartment);
router.get('/departments/:departmentId', principalController.getDepartmentDetails);

// Academic Management
router.get('/academic-year', principalController.getAcademicYear);
router.put('/academic-year', principalController.updateAcademicYear);
router.get('/holidays', principalController.getHolidays);
router.post('/holidays', principalController.createHoliday);
router.put('/holidays/:holidayId', principalController.updateHoliday);
router.delete('/holidays/:holidayId', principalController.deleteHoliday);
router.get('/curriculum', principalController.getCurriculumOverview);
router.get('/curriculum/debug', principalController.debugCurriculumData);
router.get('/curriculum/:className', principalController.getClassCurriculumDetails);
router.get('/examinations', principalController.getAllExaminations);
router.get('/results', principalController.getAcademicResults);
router.get('/attendance', principalController.getAttendanceOverview);

// Reports
router.get('/reports/school', principalController.getSchoolReports);
router.get('/reports/departments', principalController.getDepartmentReports);
router.get('/reports/staff', principalController.getStaffReports);

// Communication
router.get('/notifications', principalController.getNotifications);
router.get('/messages', principalController.getMessages);
router.post('/messages', principalController.sendMessage);

// Lesson Plan Approval
router.get('/lesson-plans', principalController.getAllLessonPlans);
router.get('/lesson-plans/pending', principalController.getLessonPlansForApproval);
router.get('/lesson-plans/test', (req, res) => res.json({ message: 'Lesson plans test route working' }));
router.put('/lesson-plans/:planId/approve', principalController.approveLessonPlan);

// Debug route to check all lesson plans
router.get('/debug/lesson-plans', async (req, res) => {
  try {
    console.log('🔍 Principal Debug: Checking all lesson plans');
    const allLessonPlans = await require('../../../models/Staff/Teacher/lessonplan.model').find({});
    console.log('📋 All lesson plans:', allLessonPlans.length);
    
    const pendingLessonPlans = await require('../../../models/Staff/Teacher/lessonplan.model').find({ status: 'Pending' });
    console.log('⏳ Pending lesson plans:', pendingLessonPlans.length);
    
    const hodApprovedLessonPlans = await require('../../../models/Staff/Teacher/lessonplan.model').find({ status: 'HOD_Approved' });
    console.log('✅ HOD Approved lesson plans:', hodApprovedLessonPlans.length);
    
    res.json({
      total: allLessonPlans.length,
      pending: pendingLessonPlans.length,
      hodApproved: hodApprovedLessonPlans.length,
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

// Expense Management
router.put('/expenses/:expenseId/approve', expenseController.approveExpense);

module.exports = router; 