const connectDB = require('./config/dbRetry');
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  try {
    await connectDB.connect();
    
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test connection status
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Connection host:', mongoose.connection.host);
    console.log('Connection name:', mongoose.connection.name);
    
    console.log('✅ Database connection test successful!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
  } finally {
    // Close connection
    await connectDB.disconnect();
    process.exit(0);
  }
}

testConnection(); 