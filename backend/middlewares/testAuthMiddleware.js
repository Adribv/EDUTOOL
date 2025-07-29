// Test authentication middleware for development/testing
const testAuth = (req, res, next) => {
  // For testing purposes, create a mock user
  req.user = {
    id: 'test-user-id',
    role: 'AdminStaff',
    name: 'Test User',
    email: 'test@example.com'
  };
  next();
};

const testAuthOptional = (req, res, next) => {
  // Optional authentication - allows requests with or without auth
  if (req.headers.authorization) {
    // If token is provided, try to verify it
    try {
      const token = req.headers.authorization.split(" ")[1];
      // For testing, just create a mock user
      req.user = {
        id: 'test-user-id',
        role: 'AdminStaff',
        name: 'Test User',
        email: 'test@example.com'
      };
    } catch (error) {
      // If token is invalid, still allow the request
      req.user = {
        id: 'test-user-id',
        role: 'AdminStaff',
        name: 'Test User',
        email: 'test@example.com'
      };
    }
  } else {
    // No token provided, still allow the request
    req.user = {
      id: 'test-user-id',
      role: 'AdminStaff',
      name: 'Test User',
      email: 'test@example.com'
    };
  }
  next();
};

module.exports = { testAuth, testAuthOptional }; 