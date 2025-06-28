const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not available. Please try again later.',
      error: 'DATABASE_CONNECTION_ERROR'
    });
  }
  
  next();
};

module.exports = dbCheck; 