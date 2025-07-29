const mongoose = require('mongoose');

/**
 * Wrapper function for database operations with retry logic
 * @param {Function} operation - The database operation to perform
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} - Result of the database operation
 */
const withRetry = async (operation, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check if connection is ready
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection not ready');
      }
      
      return await operation();
      
    } catch (error) {
      lastError = error;
      
      // Check if it's a connection-related error
      if (error.code === 'ECONNRESET' || 
          error.code === 'ETIMEDOUT' || 
          error.name === 'MongoNetworkError' ||
          error.message.includes('ECONNRESET')) {
        
        console.log(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // For non-connection errors, don't retry
      throw error;
    }
  }
  
  throw lastError;
};

/**
 * Safe database query execution
 * @param {Function} queryFn - The query function to execute
 * @returns {Promise} - Query result
 */
const safeQuery = async (queryFn) => {
  return withRetry(async () => {
    return await queryFn();
  });
};

/**
 * Safe database save operation
 * @param {mongoose.Model} model - The model instance to save
 * @returns {Promise} - Save result
 */
const safeSave = async (model) => {
  return withRetry(async () => {
    return await model.save();
  });
};

/**
 * Safe database find operation
 * @param {mongoose.Model} model - The model to query
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options
 * @returns {Promise} - Find result
 */
const safeFind = async (model, filter = {}, options = {}) => {
  return withRetry(async () => {
    return await model.find(filter, null, options);
  });
};

/**
 * Safe database findOne operation
 * @param {mongoose.Model} model - The model to query
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options
 * @returns {Promise} - FindOne result
 */
const safeFindOne = async (model, filter = {}, options = {}) => {
  return withRetry(async () => {
    return await model.findOne(filter, null, options);
  });
};

/**
 * Safe database update operation
 * @param {mongoose.Model} model - The model to update
 * @param {Object} filter - Update filter
 * @param {Object} update - Update data
 * @param {Object} options - Update options
 * @returns {Promise} - Update result
 */
const safeUpdate = async (model, filter, update, options = {}) => {
  return withRetry(async () => {
    return await model.updateMany(filter, update, options);
  });
};

/**
 * Safe database delete operation
 * @param {mongoose.Model} model - The model to delete from
 * @param {Object} filter - Delete filter
 * @param {Object} options - Delete options
 * @returns {Promise} - Delete result
 */
const safeDelete = async (model, filter, options = {}) => {
  return withRetry(async () => {
    return await model.deleteMany(filter, options);
  });
};

module.exports = {
  withRetry,
  safeQuery,
  safeSave,
  safeFind,
  safeFindOne,
  safeUpdate,
  safeDelete
}; 