const express = require('express');
const router = express.Router();
const counselorController = require('../../controllers/Staff/Counselor/counselorController');
const { permit } = require('../../middleware/permit');

// Apply role-based middleware to all routes
router.use(permit(['counselor', 'admin']));

// Session Management Routes
router.get('/sessions', counselorController.getAllSessions);
router.get('/sessions/:id', counselorController.getSessionById);
router.post('/sessions', counselorController.createSession);
router.put('/sessions/:id', counselorController.updateSession);
router.delete('/sessions/:id', counselorController.deleteSession);
router.patch('/sessions/:id/status', counselorController.updateSessionStatus);

// Assessment Routes
router.get('/assessments', counselorController.getAllAssessments);
router.get('/assessments/:id', counselorController.getAssessmentById);
router.post('/assessments', counselorController.createAssessment);
router.put('/assessments/:id', counselorController.updateAssessment);
router.delete('/assessments/:id', counselorController.deleteAssessment);

// Student Management Routes
router.get('/students', counselorController.getAllStudents);
router.get('/students/:id', counselorController.getStudentById);
router.get('/students/:id/sessions', counselorController.getStudentSessions);
router.get('/students/:id/assessments', counselorController.getStudentAssessments);

// Analytics and Reports Routes
router.get('/analytics/overview', counselorController.getOverviewAnalytics);
router.get('/analytics/sessions', counselorController.getSessionAnalytics);
router.get('/analytics/assessments', counselorController.getAssessmentAnalytics);
router.get('/analytics/trends', counselorController.getTrendAnalytics);
router.get('/reports/sessions', counselorController.generateSessionReport);
router.get('/reports/assessments', counselorController.generateAssessmentReport);

// Crisis Management Routes
router.get('/crisis-cases', counselorController.getCrisisCases);
router.post('/crisis-cases', counselorController.createCrisisCase);
router.put('/crisis-cases/:id', counselorController.updateCrisisCase);
router.patch('/crisis-cases/:id/status', counselorController.updateCrisisStatus);

// Resource Management Routes
router.get('/resources', counselorController.getResources);
router.post('/resources', counselorController.createResource);
router.put('/resources/:id', counselorController.updateResource);
router.delete('/resources/:id', counselorController.deleteResource);

module.exports = router; 