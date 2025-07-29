const express = require('express');
const router = express.Router();
const consentFormController = require('../controllers/consentForm.controller');
const { testAuthOptional } = require('../middlewares/testAuthMiddleware');

// Public routes (no auth required)
router.post('/', testAuthOptional, consentFormController.upsertTemplate);
router.get('/', testAuthOptional, consentFormController.getForm);

// Admin routes
router.get('/admin', testAuthOptional, consentFormController.getForm);
router.put('/admin/:id', testAuthOptional, consentFormController.upsertTemplate);
router.delete('/admin/:id', testAuthOptional, consentFormController.upsertTemplate);

module.exports = router; 