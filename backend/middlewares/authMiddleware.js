const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff/staffModel');
const Student = require('../models/Student/studentModel');
const Parent = require('../models/Parent/parentModel');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    // Fetch the full user data based on role
    let user;
    switch (decoded.role) {
      case 'Student':
        user = await Student.findById(decoded.id).select('-password');
        break;
      case 'Parent':
        user = await Parent.findById(decoded.id).select('-password');
        break;
      case 'AdminStaff':
      case 'Teacher':
      case 'HOD':
      case 'Principal':
      case 'Counsellor':
      case 'VicePrincipal':
      case 'Accountant':
        user = await Staff.findById(decoded.id).select('-password');
        break;
      default:
        return res.status(401).json({ message: 'Invalid user role' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set both the decoded token data and the full user data
    req.user = {
      ...decoded,
      ...user.toObject(),
      id: decoded.id // Ensure the id from token is preserved
    };
    
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(403).json({ message: 'Invalid token' });
  }
};

const isVicePrincipal = (req, res, next) => {
   // console.log(`User Role: ${req.user ? req.user.role : 'No user'}`);
   if (req.user && req.user.role === "VicePrincipal") {
      // console.log('Access granted: Vice Principal');
      return next();
   }
  return res.status(403).json({ message: 'Access denied: Vice Principal only' });
};

const isPrincipal = (req, res, next) => {
  console.log(`🔐 isPrincipal middleware - User role: ${req.user ? req.user.role : 'No user'}`);
  if (req.user && req.user.role === "Principal") {
    console.log('✅ Principal access granted');
    return next();
  }
  console.log('❌ Principal access denied');
  return res.status(403).json({ message: 'Access denied: Principal only' });
};

module.exports = { verifyToken, isVicePrincipal, isPrincipal };