const express = require('express');
const router = express.Router();
const delegationAuthorityController = require('../controllers/Staff/delegationAuthorityController');
const { verifyToken, isPrincipal, isVicePrincipal, isHOD } = require('../middlewares/authMiddleware');

// Middleware to check if user can access delegation authority features
const canAccessDelegation = (req, res, next) => {
  const allowedRoles = ['Principal', 'VicePrincipal', 'HOD'];
  if (allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
};

// Middleware to check if user can approve delegations
const canApproveDelegation = (req, res, next) => {
  const allowedRoles = ['Principal', 'VicePrincipal'];
  if (allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Only Principal and Vice Principal can approve delegations' });
};

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(canAccessDelegation);

// GET /delegation-authority/notices - Get all delegation notices
router.get('/notices', delegationAuthorityController.getAllNotices);

// GET /delegation-authority/notices/pending - Get pending notices for approval
router.get('/notices/pending', canApproveDelegation, delegationAuthorityController.getPendingNotices);

// GET /delegation-authority/notices/active - Get active delegations
router.get('/notices/active', delegationAuthorityController.getActiveDelegations);

// GET /delegation-authority/notices/:id - Get notice by ID
router.get('/notices/:id', delegationAuthorityController.getNoticeById);

// POST /delegation-authority/notices - Create new delegation notice
router.post('/notices', delegationAuthorityController.createNotice);

// PUT /delegation-authority/notices/:id - Update delegation notice
router.put('/notices/:id', delegationAuthorityController.updateNotice);

// DELETE /delegation-authority/notices/:id - Delete delegation notice
router.delete('/notices/:id', delegationAuthorityController.deleteNotice);

// PUT /delegation-authority/notices/:id/approve - Approve delegation notice
router.put('/notices/:id/approve', canApproveDelegation, delegationAuthorityController.approveNotice);

// PUT /delegation-authority/notices/:id/reject - Reject delegation notice
router.put('/notices/:id/reject', canApproveDelegation, delegationAuthorityController.rejectNotice);

// PUT /delegation-authority/notices/:id/revoke - Revoke delegation notice
router.put('/notices/:id/revoke', canApproveDelegation, delegationAuthorityController.revokeNotice);

// GET /delegation-authority/notices/:id/pdf - Generate PDF for delegation notice
router.get('/notices/:id/pdf', delegationAuthorityController.generatePDF);

// GET /delegation-authority/statistics - Get delegation statistics
router.get('/statistics', delegationAuthorityController.getStatistics);

// GET /delegation-authority/staff - Get staff members for delegation
router.get('/staff', delegationAuthorityController.getStaffMembers);

// GET /delegation-authority/departments - Get departments
router.get('/departments', delegationAuthorityController.getDepartments);

// GET /delegation-authority/delegations/staff - Get delegations by staff member
router.get('/delegations/staff', delegationAuthorityController.getDelegationsByStaff);

// GET /delegation-authority/notifications - Get notifications for current user
router.get('/notifications', delegationAuthorityController.getNotifications);

// PUT /delegation-authority/notifications/:noticeId/:notificationId/read - Mark notification as read
router.put('/notifications/:noticeId/:notificationId/read', delegationAuthorityController.markNotificationAsRead);

module.exports = router; 