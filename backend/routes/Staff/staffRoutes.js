const express3 = require('express');
const router3 = express3.Router();
const staffAuth = require('../../controllers/Staff/staffAuth');
const staffController = require('../../controllers/Staff/staff.controller');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');
const upload = require('../../middlewares/uploadMiddleware');
const uploadLessonPlan = require('../../middlewares/uploadLessonPlanMiddleware');
const Staff = require('../../models/Staff/staffModel');


router3.post('/register', staffAuth.register);
router3.post('/login', staffAuth.login);

// Profile routes
router3.get('/profile', verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router3.post('/assignments', verifyToken, permit('Teacher', 'HOD'), staffController.createAssignment);
router3.get('/assignments', verifyToken, permit('Teacher', 'HOD'), staffController.getAssignments);

router3.post('/attendance', verifyToken, permit('Teacher', 'HOD'), staffController.markAttendance);
router3.get('/attendance', verifyToken, permit('Teacher', 'HOD'), staffController.getMarkedAttendance);

// routes/staff.router.js — Additions for HOD and Teacher
router3.put('/assign', verifyToken, permit('HOD'), staffController.assignSubjectToTeacher);
router3.get('/students', verifyToken, permit('Teacher'), staffController.getAssignedStudents);
router3.get('/class-data', verifyToken, permit('Teacher'), staffController.getClassData);

router3.post('/resources',
  verifyToken,
  permit('Teacher'),
  upload.single('file'),
  staffController.uploadResource
);

router3.get('/resources', verifyToken, permit('Teacher'), async (req, res) => {
  const Resource = require('../../models/Staff/Teacher/resource.model');
  const resources = await Resource.find({ uploadedBy: req.user.id });
  res.json(resources);
});

router3.post(
  '/lessonplans',
  verifyToken,
  permit('Teacher'),
  uploadLessonPlan.single('file'),
  staffController.submitLessonPlan
);

router3.get('/lessonplans', verifyToken, permit('Teacher', 'HOD'), staffController.getLessonPlans);
router3.put('/lessonplans/:id/approve', verifyToken, permit('HOD'), staffController.approveLessonPlan);

router3.put('/grades', verifyToken, permit('Teacher'), staffController.editGrades);
//protected route for staff only:
router3.get('/dashboard', verifyToken, permit('Teacher', 'HOD', 'Principal'), (req, res) => {
  res.json({ role : `${req.user.role}` });
});

// Add reports route
router3.get('/reports', verifyToken, permit('Teacher', 'HOD', 'Principal'), async (req, res) => {
  try {
    const reports = await Staff.find({}, 'name email role assignedSubjects');
    res.json(reports);
  } catch (error) {
    console.error('Error fetching staff reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router3;