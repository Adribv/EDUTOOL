const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MongoDB Atlas (cloud) instead of local MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://edurays:edurays123@cluster0.mongodb.net/edurays?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
