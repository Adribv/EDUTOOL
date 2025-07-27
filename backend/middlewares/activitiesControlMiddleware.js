const ActivitiesControl = require('../models/Staff/ActivitiesControl');

/**
 * Check if user has access to a specific activity with required level
 * @param {string} activity - Activity name to check
 * @param {string} requiredLevel - Required access level ('View', 'Edit', 'Approve')
 * @returns {Function} Express middleware function
 */
const checkActivityAccess = (activity, requiredLevel = 'View') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user's activities control
      const activitiesControl = await ActivitiesControl.findOne({
        staffId: userId,
        isActive: true
      });

      if (!activitiesControl) {
        return res.status(403).json({
          success: false,
          message: 'No activities control found for this user'
        });
      }

      // Check if user has access to the activity
      const hasAccess = activitiesControl.hasAccess(activity, requiredLevel);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required level: ${requiredLevel} for activity: ${activity}`
        });
      }

      // Add access level info to request for use in controllers
      req.userAccessLevel = activitiesControl.getAccessLevel(activity);
      req.userActivitiesControl = activitiesControl;
      
      next();
    } catch (error) {
      console.error('Error checking activity access:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking access permissions'
      });
    }
  };
};

/**
 * Check if user has access to any of the provided activities
 * @param {string[]} activities - Array of activity names to check
 * @param {string} requiredLevel - Required access level
 * @returns {Function} Express middleware function
 */
const checkAnyActivityAccess = (activities, requiredLevel = 'View') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const activitiesControl = await ActivitiesControl.findOne({
        staffId: userId,
        isActive: true
      });

      if (!activitiesControl) {
        return res.status(403).json({
          success: false,
          message: 'No activities control found for this user'
        });
      }

      // Check if user has access to any of the activities
      const hasAnyAccess = activities.some(activity => 
        activitiesControl.hasAccess(activity, requiredLevel)
      );
      
      if (!hasAnyAccess) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required level: ${requiredLevel} for any of: ${activities.join(', ')}`
        });
      }

      req.userActivitiesControl = activitiesControl;
      next();
    } catch (error) {
      console.error('Error checking any activity access:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking access permissions'
      });
    }
  };
};

/**
 * Check if user can edit an activity
 * @param {string} activity - Activity name to check
 * @returns {Function} Express middleware function
 */
const checkEditActivityAccess = (activity) => {
  return checkActivityAccess(activity, 'Edit');
};

/**
 * Check if user can approve an activity
 * @param {string} activity - Activity name to check
 * @returns {Function} Express middleware function
 */
const checkApproveActivityAccess = (activity) => {
  return checkActivityAccess(activity, 'Approve');
};

/**
 * Get user's activities control and attach to request
 * @returns {Function} Express middleware function
 */
const getUserActivitiesControl = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const activitiesControl = await ActivitiesControl.findOne({
      staffId: userId,
      isActive: true
    });

    req.userActivitiesControl = activitiesControl;
    next();
  } catch (error) {
    console.error('Error getting user activities control:', error);
    next();
  }
};

/**
 * Check access for multiple activities with different required levels
 * @param {Object} activityLevels - Object with activity names as keys and required levels as values
 * @returns {Function} Express middleware function
 */
const checkMultipleActivities = (activityLevels) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const activitiesControl = await ActivitiesControl.findOne({
        staffId: userId,
        isActive: true
      });

      if (!activitiesControl) {
        return res.status(403).json({
          success: false,
          message: 'No activities control found for this user'
        });
      }

      // Check each activity with its required level
      for (const [activity, requiredLevel] of Object.entries(activityLevels)) {
        const hasAccess = activitiesControl.hasAccess(activity, requiredLevel);
        
        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: `Access denied. Required level: ${requiredLevel} for activity: ${activity}`
          });
        }
      }

      req.userActivitiesControl = activitiesControl;
      next();
    } catch (error) {
      console.error('Error checking multiple activities access:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking access permissions'
      });
    }
  };
};

/**
 * Check if user is Vice Principal (for activities control management)
 * @returns {Function} Express middleware function
 */
const isVicePrincipal = (req, res, next) => {
  if (req.user?.role !== 'Vice Principal') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Vice Principal role required.'
    });
  }
  next();
};

/**
 * Check if user has view access to any activity (for basic dashboard access)
 * @returns {Function} Express middleware function
 */
const hasAnyViewAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const activitiesControl = await ActivitiesControl.findOne({
      staffId: userId,
      isActive: true
    });

    // If no activities control exists, allow access (default permissions)
    if (!activitiesControl) {
      return next();
    }

    // Check if user has at least one activity with View access
    const hasAnyView = activitiesControl.activityAssignments.some(
      assignment => assignment.accessLevel !== 'Unauthorized'
    );

    if (!hasAnyView) {
      return res.status(403).json({
        success: false,
        message: 'No authorized activities found. Please contact your Vice Principal.'
      });
    }

    req.userActivitiesControl = activitiesControl;
    next();
  } catch (error) {
    console.error('Error checking any view access:', error);
    next();
  }
};

/**
 * Get user's accessible activities for frontend
 * @returns {Function} Express middleware function
 */
const getAccessibleActivities = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      req.accessibleActivities = [];
      return next();
    }

    const activitiesControl = await ActivitiesControl.findOne({
      staffId: userId,
      isActive: true
    });

    if (!activitiesControl) {
      req.accessibleActivities = [];
      return next();
    }

    // Get all activities with their access levels
    const accessibleActivities = activitiesControl.activityAssignments
      .filter(assignment => assignment.accessLevel !== 'Unauthorized')
      .map(assignment => ({
        activity: assignment.activity,
        accessLevel: assignment.accessLevel
      }));

    req.accessibleActivities = accessibleActivities;
    req.userActivitiesControl = activitiesControl;
    next();
  } catch (error) {
    console.error('Error getting accessible activities:', error);
    req.accessibleActivities = [];
    next();
  }
};

/**
 * Check if user can perform specific actions based on access level
 * @param {string} activity - Activity name
 * @param {string} action - Action to perform ('view', 'edit', 'create', 'delete', 'approve')
 * @returns {Function} Express middleware function
 */
const canPerformAction = (activity, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const activitiesControl = await ActivitiesControl.findOne({
        staffId: userId,
        isActive: true
      });

      if (!activitiesControl) {
        return res.status(403).json({
          success: false,
          message: 'No activities control found for this user'
        });
      }

      const accessLevel = activitiesControl.getAccessLevel(activity);
      let canPerform = false;

      switch (action) {
        case 'view':
          canPerform = accessLevel !== 'Unauthorized';
          break;
        case 'edit':
        case 'create':
          canPerform = ['Edit', 'Approve'].includes(accessLevel);
          break;
        case 'delete':
        case 'approve':
        case 'reject':
          canPerform = accessLevel === 'Approve';
          break;
        default:
          canPerform = false;
      }

      if (!canPerform) {
        return res.status(403).json({
          success: false,
          message: `Cannot perform ${action} on ${activity}. Required access level not met.`
        });
      }

      req.userAccessLevel = accessLevel;
      req.userActivitiesControl = activitiesControl;
      next();
    } catch (error) {
      console.error('Error checking action permission:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking action permissions'
      });
    }
  };
};

module.exports = {
  checkActivityAccess,
  checkAnyActivityAccess,
  checkEditActivityAccess,
  checkApproveActivityAccess,
  getUserActivitiesControl,
  checkMultipleActivities,
  isVicePrincipal,
  hasAnyViewAccess,
  getAccessibleActivities,
  canPerformAction
}; 