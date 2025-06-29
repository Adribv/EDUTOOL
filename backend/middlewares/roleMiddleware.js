const permit = (...allowedRoles) => {
    return (req, res, next) => {
      if (req.user && allowedRoles.includes(req.user.role)) {
        next();
      } else {
        console.error(`Access denied for user with role: ${req.user ? req.user : 'unknown'}`);
        res.status(403).json({ message: 'Access denied' });
      }
    }
  };
  
  module.exports = { permit };
  