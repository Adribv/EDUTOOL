const express = require('express');
const router = express.Router();
const adminStaffController = require('../../../controllers/Staff/Admin/adminStaffController');
const feeRecordsController = require('../../../controllers/Staff/Admin/feeRecordsController');
const enquiryController = require('../../../controllers/Staff/Admin/enquiryController');
const supplierRequestController = require('../../../controllers/Staff/Admin/supplierRequestController');
const { permit } = require('../../../middlewares/roleMiddleware');
const { verifyToken } = require('../../../middlewares/authMiddleware');
const uploadProfileImage = require('../../../middlewares/uploadProfileImageMiddleware');
const uploadStudentFiles = require('../../../middlewares/uploadStudentFilesMiddleware');
const upload = require('../../../middlewares/uploadMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import models
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');
const Parent = require('../../../models/Parent/parentModel');

// Admin/Staff Authentication (Public route - no auth required)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: staff._id, role: staff.role, email: staff.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public routes (no auth required)
router.get('/classes/public', adminStaffController.getClasses);
router.post('/classes/public', adminStaffController.createClass);
router.get('/staff/teachers/public', adminStaffController.getAllTeachers);
router.get('/staff/public', adminStaffController.getAllStaff);
router.get('/students/public', adminStaffController.getAllStudents);
router.get('/students/export', adminStaffController.exportStudents);
router.post('/students/public', uploadStudentFiles, adminStaffController.registerStudent);
router.post('/students/bulk', adminStaffController.bulkImportStudents);
router.put('/students/public/:id', uploadStudentFiles, adminStaffController.updateStudent);
router.delete('/students/public/:id', adminStaffController.deleteStudent);
router.get('/fee-structure/public', adminStaffController.getFeeStructures);
router.post('/fee-structure/public', adminStaffController.createSimpleFeeStructure);
router.put('/fee-structure/public/:id', adminStaffController.updateSimpleFeeStructure);
router.delete('/fee-structure/public/:id', adminStaffController.deleteFeeStructure);
router.get('/inventory/export', adminStaffController.exportInventory);
router.post('/inventory/bulk', adminStaffController.bulkImportInventory);
router.get('/fee-records/stats/public', feeRecordsController.getFeeRecordsStats);

// Test endpoint for fee records (no auth required)
router.post('/fee-records/test', (req, res) => {
  console.log('🧪 Test endpoint called with data:', req.body);
  console.log('👤 User info:', req.user);
  res.json({ 
    message: 'Test endpoint working',
    body: req.body,
    user: req.user,
    headers: req.headers
  });
});

// Public fee approval endpoint (no auth required)
router.post('/fee-structure/approval', adminStaffController.configureFeeStructure);

// Approval routes (no auth required for creating approvals)
router.post('/approvals', adminStaffController.createApprovalRequest);
router.get('/approvals', adminStaffController.getApprovalRequests);
router.get('/approvals/:id', adminStaffController.getApprovalRequestById);
router.put('/approvals/:id', adminStaffController.updateApprovalRequest);
router.delete('/approvals/:id', adminStaffController.deleteApprovalRequest);

// Public routes additions (before auth middleware)
router.post('/enquiries', enquiryController.createEnquiry);
router.post('/enquiries/bulk', enquiryController.bulkImportEnquiries);
router.post('/service-requests', adminStaffController.createServiceRequest);

// Apply authentication middleware to all routes below this line
router.use(verifyToken);
router.use(permit('AdminStaff'));

// Profile Management
router.get('/profile', adminStaffController.getProfile);
router.put('/profile', adminStaffController.updateProfile);
router.post('/profile/image', uploadProfileImage.single('image'), adminStaffController.updateProfileImage);
router.put('/profile/password', adminStaffController.updatePassword);

// Dashboard
router.get('/dashboard', adminStaffController.getDashboardStats);

// Student Records Management
router.get('/students', adminStaffController.getAllStudents);
router.get('/students/:id', adminStaffController.getStudentById);
router.post('/students', adminStaffController.registerStudent);
router.put('/students/:id', adminStaffController.updateStudent);
router.delete('/students/:id', adminStaffController.deleteStudent);
router.get('/students/:id/id-card', adminStaffController.generateStudentID);
router.post('/students/transfer', adminStaffController.processTransfer);

// Parent Records Management
router.get('/parents', adminStaffController.getAllParents);
router.get('/parents/:id', adminStaffController.getParentById);
router.post('/parents', adminStaffController.registerParent);
router.put('/parents/:id', adminStaffController.updateParent);
router.delete('/parents/:id', adminStaffController.deleteParent);

// Staff Records Administration
router.get('/staff', adminStaffController.getAllStaff);
router.get('/staff/teachers', adminStaffController.getAllTeachers);
router.get('/staff/:id', adminStaffController.getStaffById);
router.post('/staff', adminStaffController.registerStaff);
router.put('/staff/:id', adminStaffController.updateStaff);
router.delete('/staff/:id', adminStaffController.deleteStaff);
router.get('/staff/:id/id-card', adminStaffController.generateStaffID);
router.post('/staff/attendance', adminStaffController.trackStaffAttendance);

// Accountant Management
router.get('/accountants', adminStaffController.getAllAccountants);
router.post('/accountants', adminStaffController.registerAccountant);

// Department Management
router.get('/departments', adminStaffController.getAllDepartments);

// Fee Management System
router.post('/fee-structure', adminStaffController.configureFeeStructure);
router.post('/fee-invoice', adminStaffController.generateFeeInvoice);
router.post('/fee-payment', adminStaffController.processFeePayment);
router.get('/fee-defaulters', adminStaffController.getFeeDefaulters);
router.get('/fee-structure', adminStaffController.getFeeStructures);
router.delete('/fee-structure/:id', adminStaffController.deleteFeeStructure);

// Inventory Control
router.post('/inventory', adminStaffController.addInventoryItem);
router.put('/inventory/:id', adminStaffController.updateInventoryItem);
router.post('/inventory/issue', adminStaffController.issueInventoryItem);
router.get('/inventory/low-stock', adminStaffController.getLowStockItems);
router.get('/inventory', adminStaffController.getInventory);
router.delete('/inventory/:id', adminStaffController.deleteInventoryItem);

// Transport Management
router.post('/transport/vehicles', adminStaffController.addTransportVehicle);
router.put('/transport/vehicles/:id', adminStaffController.updateTransportVehicle);
router.post('/transport/assign-student', adminStaffController.assignStudentToTransport);
router.post('/transport/maintenance', adminStaffController.scheduleVehicleMaintenance);

// Visitor Management
router.post('/visitors', upload.single('attachDocument'), adminStaffController.recordVisitor);
router.put('/visitors/:id/exit', adminStaffController.updateVisitorExit);
router.get('/visitors', adminStaffController.getVisitorLog);
router.post('/visitors/bulk', adminStaffController.bulkImportVisitors);

// Enquiry Management
router.route('/enquiries')
  .get(enquiryController.getAllEnquiries);
router.get('/enquiries/stats', enquiryController.getEnquiryStats);
router.put('/enquiries/:id/reply', enquiryController.updateEnquiry);
router.put('/enquiries/:id/status', enquiryController.updateEnquiry);

// Supplier Request Management
router.get('/supplier-requests', supplierRequestController.getAllSupplierRequests);
router.get('/supplier-requests/:id', supplierRequestController.getSupplierRequestById);
router.post('/supplier-requests', supplierRequestController.createSupplierRequest);
router.put('/supplier-requests/:id', supplierRequestController.updateSupplierRequest);
router.delete('/supplier-requests/:id', supplierRequestController.deleteSupplierRequest);
router.post('/supplier-requests/:id/notes', supplierRequestController.addNote);
router.get('/supplier-requests/stats', supplierRequestController.getSupplierRequestStats);
router.post('/supplier-requests/:id/submit', supplierRequestController.submitForApproval);

// Event and Facility Coordination
router.post('/events', adminStaffController.createEvent);
router.put('/events/:id', adminStaffController.updateEvent);
router.post('/facilities/book', adminStaffController.bookFacility);

// Communication Support
router.post('/communications', adminStaffController.sendBulkCommunication);
router.get('/communications', adminStaffController.getCommunicationHistory);
router.put('/communications/:id/status', adminStaffController.updateCommunicationStatus);
router.put('/communications/:id', adminStaffController.updateCommunication);

// Reporting and Records
router.get('/reports/enrollment', adminStaffController.generateEnrollmentReport);
router.get('/reports/staff', adminStaffController.generateStaffReport);
router.get('/reports/fee-collection', adminStaffController.generateFeeCollectionReport);

// Calendar Management
router.post('/calendar', adminStaffController.addCalendarEvent);
router.put('/calendar/:id', adminStaffController.updateCalendarEvent);
router.get('/calendar', adminStaffController.getCalendarEvents);
router.delete('/calendar/:id', adminStaffController.deleteCalendarEvent);

// Academic Structure Routes
router.route('/classes')
  .get(adminStaffController.getClasses)
  .post(adminStaffController.createClass);
router.route('/classes/:id')
  .put(adminStaffController.updateClass)
  .delete(adminStaffController.deleteClass);

router.route('/subjects')
  .get(adminStaffController.getSubjects)
  .post(adminStaffController.createSubject);
router.route('/subjects/:id')
  .put(adminStaffController.updateSubject)
  .delete(adminStaffController.deleteSubject);

router.route('/schedules')
  .get(adminStaffController.getSchedules)
  .post(adminStaffController.createSchedule);
router.route('/schedules/:id')
  .put(adminStaffController.updateSchedule)
  .delete(adminStaffController.deleteSchedule);

// Supplier & Supply Request Management
router.route('/suppliers')
  .get(adminStaffController.getSuppliers)
  .post(adminStaffController.addSupplier);

router.route('/supply-requests')
  .get(adminStaffController.getSupplyRequests)
  .post(adminStaffController.createSupplyRequest);

router.put('/supply-requests/:id/status', adminStaffController.updateSupplyRequestStatus);

// Fee Records Management Routes
router.get('/fee-records/student', feeRecordsController.getStudentFeeRecords);
router.post('/fee-records/student', feeRecordsController.createStudentFeeRecord);
router.post('/fee-records/student/bulk-import', feeRecordsController.bulkImportStudentFeeRecords);

router.get('/fee-records/staff', feeRecordsController.getStaffSalaryRecords);
router.post('/fee-records/staff', feeRecordsController.createStaffSalaryRecord);
router.post('/fee-records/staff/bulk-import', feeRecordsController.bulkImportStaffSalaryRecords);

router.get('/fee-records/stats', feeRecordsController.getFeeRecordsStats);

module.exports = router;