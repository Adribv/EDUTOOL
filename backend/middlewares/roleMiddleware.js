const permit = (...allowedRoles) => {
    return (req, res, next) => {
      if (req.user && allowedRoles.includes(req.user.role)) {
        next();
      } else {
        console.error(`Access denied for user with role: ${req.user ? req.user.role : 'unknown'}`);
        console.error('Allowed roles:', allowedRoles);
        console.error('User object:', req.user);
        res.status(403).json({ 
          message: 'Access denied',
          userRole: req.user ? req.user.role : 'unknown',
          allowedRoles: allowedRoles
        });
      }
    }
  };
  
  module.exports = { permit };
  