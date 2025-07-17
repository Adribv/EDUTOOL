const express = require('express');
const router = express.Router();
const disciplinaryFormController = require('../controllers/disciplinaryForm.controller');
const { testAuthOptional } = require('../middlewares/testAuthMiddleware');

// Teacher routes
router.post('/teacher', testAuthOptional, disciplinaryFormController.createForm);
router.get('/teacher/:teacherId', testAuthOptional, disciplinaryFormController.getTeacherForms);
router.put('/teacher/:id', testAuthOptional, disciplinaryFormController.updateForm);
router.delete('/teacher/:id', testAuthOptional, disciplinaryFormController.deleteForm);

// Admin routes
router.get('/admin', testAuthOptional, disciplinaryFormController.getAllForms);
router.get('/admin/:id', testAuthOptional, disciplinaryFormController.getFormById);
router.put('/admin/:id', testAuthOptional, disciplinaryFormController.updateForm);
router.delete('/admin/:id', testAuthOptional, disciplinaryFormController.deleteForm);
router.get('/admin/stats', testAuthOptional, disciplinaryFormController.getFormStats);

// Student routes
router.get('/student/:studentId', testAuthOptional, disciplinaryFormController.getStudentForms);
router.put('/student/:id/acknowledge', testAuthOptional, disciplinaryFormController.studentAcknowledge);

// Parent routes
router.get('/parent/:parentId', testAuthOptional, disciplinaryFormController.getParentForms);
router.put('/parent/:id/acknowledge', testAuthOptional, disciplinaryFormController.parentAcknowledge);

// Public routes
router.get('/template', disciplinaryFormController.getTemplate);

module.exports = router; 