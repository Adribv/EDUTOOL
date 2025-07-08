const express = require('express');
const router = express.Router();
const principalController = require('../../../controllers/Staff/Principal/principalController');
const { verifyToken, isPrincipal } = require('../../../middlewares/authMiddleware');
const expenseController = require('../../../controllers/Finance/expenseController');

// All routes require authentication and Principal role
router.use(verifyToken, isPrincipal);

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

// Expense Management
router.put('/expenses/:expenseId/approve', expenseController.approveExpense);

module.exports = router; 