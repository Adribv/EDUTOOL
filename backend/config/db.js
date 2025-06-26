const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MongoDB Atlas (cloud) instead of local MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://edurays:edurays123@cluster0.mongodb.net/edurays?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit the process, just log the error
    console.log('Continuing without database connection...');
  }
};

module.exports = connectDB;
