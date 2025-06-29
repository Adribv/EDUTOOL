const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
const uploadDirs = {
  profiles: 'uploads/profiles',
  assignments: 'uploads/assignments',
  resources: 'uploads/resources',
  lessonPlans: 'uploads/lesson-plans',
  homework: 'uploads/homework',
  documents: 'uploads/documents'
};

Object.values(uploadDirs).forEach(ensureDirectoryExists);

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on route
    if (req.route.path.includes('assignments')) {
      uploadPath = uploadDirs.assignments;
    } else if (req.route.path.includes('homework')) {
      uploadPath = uploadDirs.homework;
    } else if (req.route.path.includes('resources')) {
      uploadPath = uploadDirs.resources;
    } else if (req.route.path.includes('lesson-plans')) {
      uploadPath = uploadDirs.lessonPlans;
    } else if (req.route.path.includes('profile')) {
      uploadPath = uploadDirs.profiles;
    } else {
      uploadPath = uploadDirs.documents;
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar']
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR, JPG, PNG, GIF'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum 5 files allowed.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
};

module.exports = upload;
module.exports.handleUploadError = handleUploadError;