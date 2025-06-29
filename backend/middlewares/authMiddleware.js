const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (err) {
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
  if (req.user && req.user.role === "Principal") {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Principal only' });
};

module.exports = { verifyToken, isVicePrincipal, isPrincipal };