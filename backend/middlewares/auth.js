const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff/staffModel');
const Student = require('../models/Student/studentModel');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Decoded token: ${JSON.stringify(decoded)}`); // Debugging line

    if (decoded.role === 'staff') {
      req.user = await Staff.findById(decoded.id);
    } else if (decoded.role === 'student') {
      req.user = await Student.findById(decoded.id);
    } else {
      return res.status(401).json({ message: 'Invalid user role' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    console.log(`User found: ${req.user}`); // Debugging line
    next();
  } catch (err) {
    console.error('Error verifying token:', err); // Debugging line
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && !roles.includes('all')) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};