const express = require('express');
const router = express.Router();
const staffAuth = require('../../controllers/Staff/staffAuth');
const staffController = require('../../controllers/Staff/staff.controller');
const newStaffController = require('../../controllers/Staff/staffController');
const activitiesControlController = require('../../controllers/Staff/VP/activitiesControlController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');
const upload = require('../../middlewares/uploadMiddleware');
const uploadLessonPlan = require('../../middlewares/uploadLessonPlanMiddleware');
const Staff = require('../../models/Staff/staffModel');
const bcrypt = require('bcryptjs');

// Authentication routes
router.post('/register', staffAuth.register);
router.post('/login', staffAuth.login);

// Staff can get their own activities control
router.get('/activities-control/me', verifyToken, activitiesControlController.getMyActivities);

// Profile routes
router.get('/profile', verifyToken, async (req, res) => {
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

// Update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      bio,
      designation,
      emergencyContact,
      skills,
      languages,
      socialMedia,
      preferences
    } = req.body;

    const updateData = {};
    
    // Only allow updating specific fields
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (bio) updateData.bio = bio;
    if (designation) updateData.designation = designation;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (skills) updateData.skills = skills;
    if (languages) updateData.languages = languages;
    if (socialMedia) updateData.socialMedia = socialMedia;
    if (preferences) updateData.preferences = preferences;

    const staff = await Staff.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Profile updated successfully', staff });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Verify current password
    const isPasswordValid = await staff.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    staff.password = newPassword;
    await staff.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image
router.put('/profile-image', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    const profileImageUrl = req.file.path; // Adjust based on your file storage setup

    const staff = await Staff.findByIdAndUpdate(
      req.user.id,
      { profileImage: profileImageUrl },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Profile image updated successfully', profileImage: profileImageUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Professional Development Management
router.post('/professional-development', verifyToken, async (req, res) => {
  try {
    const {
      title,
      institution,
      date,
      duration,
      certificate,
      description
    } = req.body;

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    staff.professionalDevelopment.push({
      title,
      institution,
      date,
      duration,
      certificate,
      description
    });

    await staff.save();

    res.json({ 
      message: 'Professional development record added successfully',
      professionalDevelopment: staff.professionalDevelopment
    });
  } catch (error) {
    console.error('Error adding professional development:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/professional-development/:index', verifyToken, async (req, res) => {
  try {
    const { index } = req.params;
    const {
      title,
      institution,
      date,
      duration,
      certificate,
      description
    } = req.body;

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (index < 0 || index >= staff.professionalDevelopment.length) {
      return res.status(400).json({ message: 'Invalid professional development record index' });
    }

    staff.professionalDevelopment[index] = {
      title,
      institution,
      date,
      duration,
      certificate,
      description
    };

    await staff.save();

    res.json({ 
      message: 'Professional development record updated successfully',
      professionalDevelopment: staff.professionalDevelopment
    });
  } catch (error) {
    console.error('Error updating professional development:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/professional-development/:index', verifyToken, async (req, res) => {
  try {
    const { index } = req.params;

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (index < 0 || index >= staff.professionalDevelopment.length) {
      return res.status(400).json({ message: 'Invalid professional development record index' });
    }

    staff.professionalDevelopment.splice(index, 1);
    await staff.save();

    res.json({ 
      message: 'Professional development record deleted successfully',
      professionalDevelopment: staff.professionalDevelopment
    });
  } catch (error) {
    console.error('Error deleting professional development:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public profile (for other staff members)
router.get('/profile/:id', verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Check privacy settings
    if (staff.preferences?.privacy?.profileVisibility === 'private') {
      return res.status(403).json({ message: 'Profile is private' });
    }

    // Filter out sensitive information based on privacy settings
    const publicProfile = {
      _id: staff._id,
      name: staff.name,
      role: staff.role,
      department: staff.department,
      designation: staff.designation,
      bio: staff.bio,
      profileImage: staff.profileImage,
      skills: staff.skills,
      languages: staff.languages,
      professionalDevelopment: staff.professionalDevelopment,
      socialMedia: staff.socialMedia
    };

    // Add contact info only if allowed
    if (staff.preferences?.privacy?.showContactInfo) {
      publicProfile.email = staff.email;
      publicProfile.phone = staff.phone;
    }

    res.json(publicProfile);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher and HOD specific routes
router.post('/assignments', verifyToken, permit('Teacher', 'HOD'), staffController.createAssignment);
router.get('/assignments', verifyToken, permit('Teacher', 'HOD'), staffController.getAssignments);

router.post('/attendance', verifyToken, permit('Teacher', 'HOD'), staffController.markAttendance);
router.get('/attendance', verifyToken, permit('Teacher', 'HOD'), staffController.getMarkedAttendance);

// HOD specific routes
router.put('/assign', verifyToken, permit('HOD'), staffController.assignSubjectToTeacher);
router.get('/students', verifyToken, permit('Teacher'), staffController.getAssignedStudents);
router.get('/class-data', verifyToken, permit('Teacher'), staffController.getClassData);

// Resource management
router.post('/resources',
  verifyToken,
  permit('Teacher'),
  upload.single('file'),
  staffController.uploadResource
);

router.get('/resources', verifyToken, permit('Teacher'), async (req, res) => {
  const Resource = require('../../models/Staff/Teacher/resource.model');
  const resources = await Resource.find({ uploadedBy: req.user.id });
  res.json(resources);
});

// Lesson plan management
router.post(
  '/lessonplans',
  verifyToken,
  permit('Teacher'),
  uploadLessonPlan.single('file'),
  staffController.submitLessonPlan
);

router.get('/lessonplans', verifyToken, permit('Teacher', 'HOD'), staffController.getLessonPlans);
router.put('/lessonplans/:id/approve', verifyToken, permit('HOD'), staffController.approveLessonPlan);

// Grade management
router.put('/grades', verifyToken, permit('Teacher'), staffController.editGrades);

// Dashboard routes
router.get('/dashboard', verifyToken, permit('Teacher', 'HOD', 'Principal'), (req, res) => {
  res.json({ role : `${req.user.role}` });
});

// Reports route
router.get('/reports', verifyToken, permit('Teacher', 'HOD', 'Principal'), async (req, res) => {
  try {
    const reports = await Staff.find({}, 'name email role assignedSubjects');
    res.json(reports);
  } catch (error) {
    console.error('Error fetching staff reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Staff Dashboard Routes
router.get('/dashboard', verifyToken, newStaffController.getStaffDashboard);
router.get('/:staffId/coordinated-students', verifyToken, newStaffController.getCoordinatedStudents);
router.get('/:staffId/coordinated-parents', verifyToken, newStaffController.getCoordinatedParents);
router.get('/:staffId/coordinated-classes', verifyToken, newStaffController.getCoordinatedClasses);
router.get('/:staffId/profile', verifyToken, newStaffController.getStaffProfile);
router.put('/:staffId/profile', verifyToken, newStaffController.updateStaffProfile);

// Leave Request Routes
router.get('/:staffId/leave-requests', verifyToken, newStaffController.getLeaveRequests);
router.put('/:staffId/leave-requests/:id', verifyToken, newStaffController.updateLeaveRequest);

// Student Attendance Routes
router.get('/:staffId/students/:studentId/attendance', verifyToken, newStaffController.getStudentAttendancePercentage);

// Exam Management - Add new route for fetching published exams
router.get('/:staffId/published-exams', verifyToken, newStaffController.getPublishedExams);

// Salary Records Route
router.get('/salary-records/:staffId', verifyToken, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    // Check if the user is requesting their own salary records or has admin privileges
    if (req.user.id !== staffId && req.user.role !== 'AdminStaff' && req.user.role !== 'Accountant') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Import the StaffSalaryRecord model
    const StaffSalaryRecord = require('../../models/Finance/staffSalaryRecordModel');
    
    // Find salary records for the staff member
    const salaryRecords = await StaffSalaryRecord.find({ staffId })
      .sort({ year: -1, month: -1 }) // Sort by year and month descending
      .limit(24); // Limit to last 24 months
    
    // Return the records directly as an array
    res.json(salaryRecords);
  } catch (error) {
    console.error('Error fetching salary records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;