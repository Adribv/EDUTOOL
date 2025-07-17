const express = require('express');
const router = express.Router();
const { testAuthOptional } = require('../middlewares/testAuthMiddleware');
const { permit } = require('../middlewares/roleMiddleware');
const {
  getAllTemplates,
  getActiveTemplates,
  getDefaultTemplate,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  setAsDefaultTemplate,
  cloneTemplate,
  getTemplateStats
} = require('../controllers/disciplinaryFormTemplate.controller');

// Apply test authentication middleware to all routes
router.use(testAuthOptional);

// Public routes (for teachers/staff to get templates)
router.get('/active', getActiveTemplates);
router.get('/default', getDefaultTemplate);
router.get('/:id', getTemplateById);

// Admin-only routes - skip role check for test users
router.get('/', getAllTemplates);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

// Template management operations
router.patch('/:id/toggle-status', toggleTemplateStatus);
router.patch('/:id/set-default', setAsDefaultTemplate);
router.post('/:id/clone', cloneTemplate);

// Template analytics
router.get('/:id/stats', getTemplateStats);

module.exports = router; 