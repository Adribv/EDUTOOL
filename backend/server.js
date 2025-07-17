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

// const allowedOrigins = ['https://edulives.com', 'https://www.edulives.com', 'https://api.edulives.com'];
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://edulives.com', 'https://www.edulives.com', 'https://api.edulives.com'];

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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

// Initialize default templates
const initializeDefaultTemplates = async () => {
  try {
    const DisciplinaryFormTemplate = require('./models/disciplinaryFormTemplate.model');
    
    // Check if default template exists
    const defaultTemplate = await DisciplinaryFormTemplate.findOne({ isDefault: true });
    
    if (!defaultTemplate) {
      console.log('Creating default disciplinary form template...');
      const defaultData = DisciplinaryFormTemplate.getDefaultTemplate();
      
      // Create with system user
      const template = new DisciplinaryFormTemplate({
        ...defaultData,
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: 'System'
      });
      
      await template.save();
      console.log('Default disciplinary form template created successfully');
    }
  } catch (error) {
    console.error('Error initializing default templates:', error);
  }
};

// Initialize after database connection
setTimeout(initializeDefaultTemplates, 2000);

app.use('/api', authModule);
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin-staff', require('./routes/Staff/Admin/adminStaffRoutes'));
app.use('/api/teachers', require('./routes/Staff/teacherRoutes'));
app.use('/api/students', require('./routes/Student/studentRoutes'));
app.use('/api/parents', require('./routes/Parent/parentRoutes'));
app.use('/api/staffs', require('./routes/Staff/staffRoutes'));
app.use('/api/hod', require('./routes/Staff/hodRoutes'));
app.use('/api/principal', require('./routes/Staff/Principal/principalRoutes'));
app.use('/api/vp', require('./routes/Staff/VP/vicePrincipalRoutes'));
app.use('/api/accountant', require('./routes/Staff/accountantRoutes'));
app.use('/api/consent-forms', require('./routes/consentForm.routes'));
app.use('/api/syllabus-completion', require('./routes/syllabusCompletion.routes'));
app.use('/api/teacher-remarks', require('./routes/teacherRemarks.routes'));
app.use('/api/admin-staff/consent-forms', require('./routes/consentForm.routes'));
app.use('/api/disciplinary-forms', require('./routes/disciplinaryForm.routes'));
app.use('/api/disciplinary-templates', require('./routes/disciplinaryFormTemplate.routes'));
app.use('/api/transport-forms', require('./routes/transportForm.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Improved server startup with port conflict handling
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API base: http://localhost:${PORT}/api`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} is busy, trying ${PORT + 1}...`);
      const newPort = PORT + 1;
      const newServer = app.listen(newPort, () => {
        console.log(`✅ Server running on port ${newPort}`);
        console.log(`🏥 Health check: http://localhost:${newPort}/health`);
        console.log(`📚 API base: http://localhost:${newPort}/api`);
      });
    } else {
      console.error('❌ Server error:', error);
    }
  });

  return server;
};

startServer();
