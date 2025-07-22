const express = require('express');
const router = express.Router();
const parentAuthController = require('../../controllers/Parent/parentAuth');
const parentController = require('../../controllers/Parent/parentController');
const { verifyToken } = require('../../middlewares/authMiddleware');

// Auth routes
router.post('/register', parentAuthController.register);
router.post('/login', parentAuthController.login);

// Protected routes
router.use(verifyToken);

// Dashboard
router.get('/dashboard', parentController.getDashboard);

// Profile
router.get('/profile', parentController.getProfile);
router.put('/profile', parentController.updateProfile);
router.post('/profile/image', parentController.uploadProfileImage);

// 1. Child Profile Access
router.get('/children', parentController.getChildrenProfiles);
router.get('/children/fee-status', parentController.getChildrenFeeStatus);
router.post('/create-test-parent', parentController.createTestParent);
router.get('/children/:rollNumber', parentController.getChildProfile);
router.post('/children/:rollNumber/update-request', parentController.requestProfileUpdate);

// 2. Academic Monitoring
router.get('/children/:rollNumber/timetable', parentController.getChildTimetable);
router.get('/children/:rollNumber/subjects', parentController.getChildSubjects);
router.get('/children/:rollNumber/assignments', parentController.getChildAssignments);
router.get('/children/:rollNumber/performance', parentController.getChildPerformance);

// 3. Attendance Oversight
router.get('/children/:rollNumber/attendance', parentController.getChildAttendance);
router.post('/children/:rollNumber/leave-application', parentController.submitLeaveApplication);
router.get('/children/:rollNumber/leave-applications', parentController.getChildLeaveApplications);

// 4. Examination and Results
router.get('/children/:rollNumber/exams', parentController.getChildUpcomingExams);
router.get('/children/:rollNumber/exam-results', parentController.getChildExamResults);
router.get('/children/:rollNumber/report-cards', parentController.getChildReportCards);
router.get('/children/:rollNumber/exam-schedule', parentController.getChildExamSchedule);

// 5. Fee Management
router.get('/children/:rollNumber/fee-structure', parentController.getChildFeeStructure);
router.get('/children/:rollNumber/payment-status', parentController.getChildPaymentStatus);
router.get('/children/:rollNumber/payment-receipts/:paymentId', parentController.getChildPaymentReceipt);
router.post('/payments', parentController.makePayment);
router.get('/payment-methods', parentController.getPaymentMethods);

// 6. Communication Tools
router.post('/messages', parentController.sendMessage);
router.get('/messages/received', parentController.getReceivedMessages);
router.get('/messages/sent', parentController.getSentMessages);
router.post('/complaints', parentController.submitComplaint);
router.post('/meetings', parentController.scheduleMeeting);
router.get('/announcements', parentController.getAnnouncements);

// 7. Transport Tracking
router.get('/children/:rollNumber/transport', parentController.getChildTransportInfo);
router.post('/transport/contact', parentController.contactTransportCoordinator);

// 8. Calendar Access
router.get('/calendar', parentController.getSchoolCalendar);

// 9. Health and Wellness
router.get('/children/:rollNumber/health', parentController.getChildHealthInfo);
router.get('/children/:rollNumber/health/incidents', parentController.getChildHealthIncidents);
router.get('/children/:rollNumber/health/counselor-recommendations', parentController.getChildCounselorRecommendations);

// 10. Document Center
router.get('/children/:rollNumber/fee-receipts', parentController.getChildFeeReceipts);
router.get('/school-documents', parentController.getSchoolDocuments);
router.get('/children/:rollNumber/certificates', parentController.getChildCertificates);

// Student Linking
router.post('/link-student', parentController.linkStudent);

// Transport form routes for parents
router.get('/transport-forms', parentController.getParentTransportForms);
router.post('/transport-forms', parentController.createTransportForm);
router.get('/transport-forms/:formId', parentController.getTransportFormById);
router.put('/transport-forms/:formId', parentController.updateTransportForm);
router.delete('/transport-forms/:formId', parentController.deleteTransportForm);
router.get('/transport-forms/:formId/download-pdf', parentController.downloadTransportFormPDF);

// Download admin-created transport form PDF (for events/calendar)
router.get('/transport-forms/:formId/download-admin-pdf', parentController.downloadAdminTransportFormPDF);

// Debug endpoint
router.get('/debug', parentController.debugParentData);



// Add/remove students under a parent
router.put('/:parentId/add-student', parentAuthController.addStudent);
router.put('/:parentId/remove-student', parentAuthController.removeStudent);

module.exports = router;