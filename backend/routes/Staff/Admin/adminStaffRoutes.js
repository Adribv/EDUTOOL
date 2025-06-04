const express = require('express');
const router = express.Router();
const adminStaffController = require('../../../controllers/Staff/Admin/adminStaffController');
const { permit } = require('../../../middlewares/roleMiddleware');
const { verifyToken } = require('../../../middlewares/authMiddleware');
const uploadMiddleware = require('../../../middlewares/uploadMiddleware');

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(permit('AdminStaff'))

// Dashboard
router.get('/dashboard', adminStaffController.getDashboardStats);

// 1. Student Records Management
router.get('/students', adminStaffController.getAllStudents);
router.get('/students/:id', adminStaffController.getStudentById);
router.post('/students', adminStaffController.registerStudent);
router.put('/students/:id', adminStaffController.updateStudent);
router.get('/students/:id/id-card', adminStaffController.generateStudentID);
router.post('/students/transfer', adminStaffController.processTransfer);

// 2. Staff Records Administration
router.get('/staff', adminStaffController.getAllStaff);
router.get('/staff/:id', adminStaffController.getStaffById);
router.post('/staff', adminStaffController.registerStaff);
router.put('/staff/:id', adminStaffController.updateStaff);
router.get('/staff/:id/id-card', adminStaffController.generateStaffID);
router.post('/staff/attendance', adminStaffController.trackStaffAttendance);

// 3. Fee Management System
router.post('/fee-structure', adminStaffController.configureFeeStructure);
router.post('/fee-invoice', adminStaffController.generateFeeInvoice);
router.post('/fee-payment', adminStaffController.processFeePayment);
router.get('/fee-defaulters', adminStaffController.getFeeDefaulters);

// 4. Inventory Control
router.post('/inventory', adminStaffController.addInventoryItem);
router.put('/inventory/:id', adminStaffController.updateInventoryItem);
router.post('/inventory/issue', adminStaffController.issueInventoryItem);
router.get('/inventory/low-stock', adminStaffController.getLowStockItems);

// 5. Transport Management
router.post('/transport/vehicles', adminStaffController.addTransportVehicle);
router.put('/transport/vehicles/:id', adminStaffController.updateTransportVehicle);
router.post('/transport/assign-student', adminStaffController.assignStudentToTransport);
router.post('/transport/maintenance', adminStaffController.scheduleVehicleMaintenance);

// 6. Visitor Management
router.post('/visitors', adminStaffController.recordVisitor);
router.put('/visitors/:id/exit', adminStaffController.updateVisitorExit);
router.get('/visitors', adminStaffController.getVisitorLog);

// 7. Event and Facility Coordination
router.post('/events', adminStaffController.createEvent);
router.put('/events/:id', adminStaffController.updateEvent);
router.post('/facilities/book', adminStaffController.bookFacility);

// 8. Communication Support
router.post('/communications', adminStaffController.sendBulkCommunication);
router.get('/communications', adminStaffController.getCommunicationHistory);
router.put('/communications/:id/status', adminStaffController.updateCommunicationStatus);

// 9. Reporting and Records
router.get('/reports/enrollment', adminStaffController.generateEnrollmentReport);
router.get('/reports/staff', adminStaffController.generateStaffReport);
router.get('/reports/fee-collection', adminStaffController.generateFeeCollectionReport);

// 10. Calendar Management
router.post('/calendar', adminStaffController.addCalendarEvent);
router.put('/calendar/:id', adminStaffController.updateCalendarEvent);
router.get('/calendar', adminStaffController.getCalendarEvents);
router.delete('/calendar/:id', adminStaffController.deleteCalendarEvent);

module.exports = router;