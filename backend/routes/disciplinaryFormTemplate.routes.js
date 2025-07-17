const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
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

// Apply authentication middleware to all routes
router.use(verifyToken);

// Public routes (for teachers/staff to get templates)
router.get('/active', getActiveTemplates);
router.get('/default', getDefaultTemplate);
router.get('/:id', getTemplateById);

// Admin-only routes
router.use(permit('AdminStaff', 'Principal'));

// Template CRUD operations
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