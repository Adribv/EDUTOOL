const express = require('express');
const router = express.Router();
const syllabusCompletionController = require('../controllers/syllabusCompletion.controller');
const { testAuthOptional } = require('../middlewares/testAuthMiddleware');

// Admin routes
router.post('/admin', testAuthOptional, syllabusCompletionController.createSyllabusEntry);
router.get('/admin', testAuthOptional, syllabusCompletionController.getAllSyllabusEntries);
router.put('/admin/:id', testAuthOptional, syllabusCompletionController.updateSyllabusEntry);
router.delete('/admin/:id', testAuthOptional, syllabusCompletionController.deleteSyllabusEntry);
router.get('/admin/stats', testAuthOptional, syllabusCompletionController.getSyllabusStats);

// Teacher routes
router.get('/teacher/:teacherId', testAuthOptional, syllabusCompletionController.getTeacherSyllabusEntries);
router.put('/teacher/:id/progress', testAuthOptional, syllabusCompletionController.updateSyllabusProgress);
router.put('/teacher/:id/completion', testAuthOptional, syllabusCompletionController.updateSyllabusProgress);

// Student routes
router.get('/student', testAuthOptional, syllabusCompletionController.getStudentSyllabusEntries);

// Parent routes
router.get('/parent/:childId', testAuthOptional, syllabusCompletionController.getParentSyllabusEntries);

module.exports = router; 