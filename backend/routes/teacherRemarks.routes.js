const express = require('express');
const router = express.Router();
const teacherRemarksController = require('../controllers/teacherRemarks.controller');
const { testAuthOptional } = require('../middlewares/testAuthMiddleware');

// Admin routes
router.post('/admin', testAuthOptional, teacherRemarksController.createTeacherRemarksForm);
router.get('/admin', testAuthOptional, teacherRemarksController.getAllTeacherRemarksForms);
router.put('/admin/:id', testAuthOptional, teacherRemarksController.updateTeacherRemarksForm);
router.delete('/admin/:id', testAuthOptional, teacherRemarksController.deleteTeacherRemarksForm);
router.post('/admin/bulk', testAuthOptional, teacherRemarksController.bulkCreateTeacherRemarksForms);
router.get('/admin/stats', testAuthOptional, teacherRemarksController.getTeacherRemarksStats);
router.post('/admin/generate-report', testAuthOptional, teacherRemarksController.generateRemarksReport);

// Teacher routes
router.get('/teacher/:teacherId', testAuthOptional, teacherRemarksController.getTeacherRemarksForms);
router.put('/teacher/:id/progress', testAuthOptional, teacherRemarksController.updateRemarksFormProgress);
router.put('/teacher/:id/remarks', testAuthOptional, teacherRemarksController.updateDetailedTeacherRemarks);

// Student routes
router.get('/student', testAuthOptional, teacherRemarksController.getStudentRemarksForms);

// Parent routes
router.get('/parent/:childId', testAuthOptional, teacherRemarksController.getParentRemarksForms);

// Schema endpoint for frontend display
router.get('/schema', teacherRemarksController.getTeacherRemarksSchema);

module.exports = router; 