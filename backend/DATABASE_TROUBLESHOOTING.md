# MongoDB Connection Troubleshooting Guide

## ECONNRESET Error Solutions

The `ECONNRESET` errors you're experiencing are common with MongoDB Atlas connections. Here are the solutions implemented:

### 1. Enhanced Connection Configuration

The database connection has been improved with:
- **Increased timeouts**: 30s server selection, 60s socket timeout
- **Connection pooling**: 2-10 connections with 30s idle timeout
- **Retry logic**: Automatic retry with exponential backoff
- **Event handling**: Proper error, disconnect, and reconnect handling

### 2. Environment Variables

Create a `.env` file in the backend directory with:

```env
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origin
CORS_ORIGIN=https://edulives.com
```

### 3. Testing the Connection

Run the test script to verify the connection:

```bash
cd EDUTOOL/backend
node test-db-connection.js
```

### 4. Using Safe Database Operations

Use the new utility functions for database operations:

```javascript
const { safeFind, safeSave, safeQuery } = require('./utils/dbUtils');

// Instead of direct queries, use:
const staff = await safeFind(StaffModel, { status: 'active' });
const newStaff = await safeSave(newStaffInstance);
```

### 5. Common Causes of ECONNRESET

1. **Network Issues**: Unstable internet connection
2. **MongoDB Atlas Maintenance**: Scheduled maintenance windows
3. **Connection Pool Exhaustion**: Too many concurrent connections
4. **Firewall/Proxy Issues**: Corporate firewalls blocking connections
5. **DNS Resolution**: Issues resolving MongoDB Atlas hostnames

### 6. Additional Solutions

#### A. Check Network Connectivity
```bash
# Test connectivity to MongoDB Atlas
ping ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net
```

#### B. Verify MongoDB Atlas Status
- Check [MongoDB Atlas Status Page](https://status.cloud.mongodb.com/)
- Ensure your cluster is active and accessible

#### C. Check IP Whitelist
- Verify your IP is whitelisted in MongoDB Atlas
- Add `0.0.0.0/0` for development (not recommended for production)

#### D. Update Node.js and Dependencies
```bash
npm update mongoose
npm update
```

### 7. Production Recommendations

1. **Use Environment Variables**: Never hardcode connection strings
2. **Implement Circuit Breaker**: Add circuit breaker pattern for resilience
3. **Monitor Connection Health**: Add health check endpoints
4. **Use Connection String Options**: Add `maxPoolSize`, `minPoolSize`, etc.
5. **Implement Proper Logging**: Log connection events for debugging

### 8. Quick Fix Commands

```bash
# Restart the server
cd EDUTOOL/backend
npm start

# Test connection
node test-db-connection.js

# Check logs for connection issues
tail -f logs/app.log
```

### 9. Emergency Fallback

If connection issues persist, you can temporarily use a local MongoDB instance:

```javascript
// In config/dbRetry.js, change the fallback URI to:
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/EDULIVES';
```

### 10. Monitoring

The new connection system provides:
- Automatic retry with exponential backoff
- Connection state monitoring
- Graceful error handling
- Detailed logging for debugging

Check the console logs for connection status and retry attempts. 