const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📁 Upload destination: uploads/lessonPlan/');
    cb(null, 'uploads/lessonPlan/');
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    console.log('📄 Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  console.log('🔍 Checking file:', file.originalname, 'Type:', file.mimetype);
  
  // Allow PDF, DOC, DOCX, images, and videos
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/avi',
    'video/mov'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ File type allowed:', file.mimetype);
    cb(null, true);
  } else {
    console.log('❌ File type not allowed:', file.mimetype);
    cb(new Error(`File type ${file.mimetype} is not allowed. Please upload PDF, DOC, DOCX, images, or videos.`), false);
  }
};

const uploadLessonPlan = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = uploadLessonPlan;