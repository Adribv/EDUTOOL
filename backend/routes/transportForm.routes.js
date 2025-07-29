const express = require('express');
const router = express.Router();
const transportFormController = require('../controllers/transportForm.controller');
const { testAuthOptional } = require('../middlewares/testAuthMiddleware');

// Public routes (no auth required)
router.post('/', testAuthOptional, transportFormController.createForm);
router.get('/', testAuthOptional, transportFormController.getAllForms);

// Admin routes - specific routes first
router.get('/admin/stats', testAuthOptional, transportFormController.getFormStats);
router.get('/admin', testAuthOptional, transportFormController.getAllForms);

// Admin routes - parameterized routes
router.get('/admin/:id', testAuthOptional, transportFormController.getFormById);
router.put('/admin/:id', testAuthOptional, transportFormController.updateForm);
router.delete('/admin/:id', testAuthOptional, transportFormController.deleteForm);
router.patch('/admin/:id/status', testAuthOptional, transportFormController.updateFormStatus);
router.get('/admin/:id/download', testAuthOptional, transportFormController.downloadFormPDF);
router.post('/admin/:id/generate-pdf', testAuthOptional, transportFormController.generateFormPDF);

// Parent routes
router.get('/parent/:parentId', testAuthOptional, transportFormController.getAllForms);

module.exports = router; 