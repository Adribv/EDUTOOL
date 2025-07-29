const express = require('express');
const router = express.Router();
const disciplinaryFormController = require('../controllers/disciplinaryForm.controller');
const { testAuthOptional } = require('../middlewares/testAuthMiddleware');

// Teacher routes
router.post('/teacher/forms', testAuthOptional, disciplinaryFormController.createForm);
router.get('/teacher/forms', testAuthOptional, disciplinaryFormController.getTeacherForms);
router.put('/teacher/forms/:id', testAuthOptional, disciplinaryFormController.updateForm);
router.delete('/teacher/forms/:id', testAuthOptional, disciplinaryFormController.deleteForm);
router.post('/teacher/forms/:id/submit', testAuthOptional, disciplinaryFormController.submitForm);

// Admin routes - specific routes first
router.get('/admin/stats', testAuthOptional, disciplinaryFormController.getFormStats);
router.get('/admin/forms', testAuthOptional, disciplinaryFormController.getAllForms);
router.post('/admin/forms', testAuthOptional, disciplinaryFormController.createForm);
router.get('/admin/forms/:id', testAuthOptional, disciplinaryFormController.getFormById);
router.put('/admin/forms/:id', testAuthOptional, disciplinaryFormController.updateForm);
router.delete('/admin/forms/:id', testAuthOptional, disciplinaryFormController.deleteForm);

// Student routes
router.get('/student/forms', testAuthOptional, disciplinaryFormController.getStudentForms);
router.post('/student/forms/:id/acknowledge', testAuthOptional, disciplinaryFormController.studentAcknowledge);
router.get('/student/misconduct-records', testAuthOptional, disciplinaryFormController.getStudentDisciplinaryRecords);
router.post('/student/misconduct/:actionId/respond', testAuthOptional, disciplinaryFormController.respondToDisciplinaryAction);

// Parent routes
router.get('/parent/forms', testAuthOptional, disciplinaryFormController.getParentForms);
router.post('/parent/forms/:id/acknowledge', testAuthOptional, disciplinaryFormController.parentAcknowledge);
router.get('/parent/ward-misconduct-records', testAuthOptional, disciplinaryFormController.getWardDisciplinaryRecords);
router.post('/parent/ward-misconduct/:studentId/:actionId/respond', testAuthOptional, disciplinaryFormController.respondToWardDisciplinaryAction);

// Teacher class routes
router.get('/teacher/class-misconduct-records', testAuthOptional, disciplinaryFormController.getClassDisciplinaryRecords);

// Common routes
router.get('/forms/:id', testAuthOptional, disciplinaryFormController.getFormById);
router.get('/forms/:id/download-pdf', testAuthOptional, disciplinaryFormController.downloadFormPDF);
router.post('/forms/:id/generate-pdf', testAuthOptional, disciplinaryFormController.generateFormPDF);

// Public routes
router.get('/template', disciplinaryFormController.getTemplate);

module.exports = router; 