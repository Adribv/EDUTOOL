console.log('🚀 Quick test starting...');

try {
  // Test if the controller exists
  const newStaffController = require('./controllers/Staff/staffController');
  console.log('✅ Staff controller loaded');
  
  // Check if our function exists
  if (newStaffController.getPublishedExams) {
    console.log('✅ getPublishedExams function exists');
    console.log('Function type:', typeof newStaffController.getPublishedExams);
  } else {
    console.log('❌ getPublishedExams function not found');
    console.log('Available functions:', Object.keys(newStaffController));
  }
  
  // Test ExamPaper model
  const ExamPaper = require('./models/Staff/HOD/examPaper.model');
  console.log('✅ ExamPaper model loaded');
  
  console.log('🎉 Quick test completed successfully!');
} catch (error) {
  console.error('❌ Error in quick test:', error.message);
}

console.log('✅ Test finished'); 