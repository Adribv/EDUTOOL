const express = require('express');
const connectDB = require('./config/dbRetry');
const dotenv = require('dotenv');
const cors = require('cors');
const authModule = require('./modules/auth.modules');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000' || 'https://edulives.com',
}));

app.use(express.json());

// Create upload directories if they don't exist
const uploadDirs = [
  'uploads',
  'uploads/profiles',
  'uploads/resources',
  'uploads/lessonPlan',
  'uploads/examPapers'
];

uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database connection
connectDB.connect();

app.use('/api', authModule);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
