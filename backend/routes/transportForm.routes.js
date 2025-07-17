const express = require('express');
const router = express.Router();
const transportFormController = require('../controllers/transportForm.controller');
const { testAuthOptional } = require('../middlewares/testAuthMiddleware');

// Public routes (no auth required)
router.post('/', testAuthOptional, transportFormController.createForm);
router.get('/', testAuthOptional, transportFormController.getAllForms);

// Admin routes
router.get('/admin', testAuthOptional, transportFormController.getAllForms);
router.put('/admin/:id', testAuthOptional, transportFormController.updateForm);
router.delete('/admin/:id', testAuthOptional, transportFormController.deleteForm);
router.get('/admin/stats', testAuthOptional, transportFormController.getFormStats);

// Parent routes
router.get('/parent/:parentId', testAuthOptional, transportFormController.getAllForms);

module.exports = router; 