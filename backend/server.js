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

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000', 'https://edulives.com'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true, // Optional: needed if you send cookies
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
app.use('/api/admin-staff', require('./routes/Staff/Admin/adminStaffRoutes'));
app.use('/api/teachers', require('./routes/Staff/teacherRoutes'));
app.use('/api/students', require('./routes/Student/studentRoutes'));
app.use('/api/parents', require('./routes/Parent/parentRoutes'));
app.use('/api/staffs', require('./routes/Staff/staffRoutes'));
app.use('/api/hod', require('./routes/Staff/hodRoutes'));
app.use('/api/principal', require('./routes/Staff/Principal/principalRoutes'));
app.use('/api/vp', require('./routes/Staff/VP/vicePrincipalRoutes'));
app.use('/api/accountant', require('./routes/Staff/accountantRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
