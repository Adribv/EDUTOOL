const express = require('express');
const router = express.Router();
const meetingMinutesController = require('../../controllers/Admin/meetingMinutesController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { permit } = require('../../middlewares/roleMiddleware');

// Get meeting minutes statistics (Admin, AdminStaff, VP, Principal can view)
router.get('/stats', verifyToken, permit('Admin', 'AdminStaff', 'VP', 'Principal'), meetingMinutesController.getMeetingMinutesStats);

// Get all meeting minutes with pagination and filtering (Admin, AdminStaff, VP, Principal can view)
router.get('/', verifyToken, permit('Admin', 'AdminStaff', 'VP', 'Principal'), meetingMinutesController.getAllMeetingMinutes);

// Get meeting minutes by ID (Admin, AdminStaff, VP, Principal can view)
router.get('/:id', verifyToken, permit('Admin', 'AdminStaff', 'VP', 'Principal'), meetingMinutesController.getMeetingMinutesById);

// Create new meeting minutes (Admin and AdminStaff only)
router.post('/', verifyToken, permit('Admin', 'AdminStaff'), meetingMinutesController.createMeetingMinutes);

// Update meeting minutes (Admin, AdminStaff, VP, Principal can edit based on status)
router.put('/:id', verifyToken, permit('Admin', 'AdminStaff', 'VP', 'Principal'), meetingMinutesController.updateMeetingMinutes);

// Submit meeting minutes for approval (Admin and AdminStaff only)
router.patch('/:id/submit', verifyToken, permit('Admin', 'AdminStaff'), meetingMinutesController.submitMeetingMinutes);

// VP Approval (VP only)
router.patch('/:id/vp-approve', verifyToken, permit('VP'), meetingMinutesController.vpApproveMeetingMinutes);

// Principal Approval (Principal only)
router.patch('/:id/principal-approve', verifyToken, permit('Principal'), meetingMinutesController.principalApproveMeetingMinutes);

// Reject meeting minutes (VP or Principal)
router.patch('/:id/reject', verifyToken, permit('VP', 'Principal'), meetingMinutesController.rejectMeetingMinutes);

// Delete meeting minutes (Admin and AdminStaff only, if status is Draft)
router.delete('/:id', verifyToken, permit('Admin', 'AdminStaff'), meetingMinutesController.deleteMeetingMinutes);

module.exports = router; 