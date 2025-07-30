const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.isConnected = false;
  }

  async connect() {
    try {
      const mongoURI = process.env.MONGO_URI || 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna.uno4ffz.mongodb.net/EDULIVES?retryWrites=true&w=majority';
      
      const conn = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
        heartbeatFrequencyMS: 10000,
        bufferCommands: true,
      });

      this.isConnected = true;
      this.retryAttempts = 0;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      this.setupEventHandlers();
      return conn;
      
    } catch (error) {
      console.error(`MongoDB connection attempt ${this.retryAttempts + 1} failed:`, error.message);
      
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        console.log(`Retrying connection in ${this.retryDelay / 1000} seconds... (Attempt ${this.retryAttempts}/${this.maxRetries})`);
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, this.retryAttempts - 1);
        
        setTimeout(() => {
          this.connect();
        }, delay);
      } else {
        console.error('Max retry attempts reached. MongoDB connection failed, but server will continue running.');
        console.log('⚠️  Using mock authentication for testing purposes.');
        this.isConnected = false;
      }
    }
  }

  setupEventHandlers() {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      this.isConnected = false;
      
      // Attempt to reconnect if not already retrying
      if (this.retryAttempts === 0) {
        this.connect();
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      this.isConnected = false;
      
      // Attempt to reconnect if not already retrying
      if (this.retryAttempts === 0) {
        this.connect();
      }
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      this.isConnected = true;
      this.retryAttempts = 0;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      this.isConnected = false;
    }
  }

  isConnected() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

module.exports = new DatabaseConnection(); 