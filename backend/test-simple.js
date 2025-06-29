console.log('🚀 Starting simple test...');

// Test if the model can be loaded
try {
  const ExamPaper = require('./models/Staff/HOD/examPaper.model');
  console.log('✅ ExamPaper model loaded successfully');
  
  // Test creating a simple object
  const dummyExam = {
    subject: 'Test Subject',
    class: '10',
    examType: 'Quiz',
    duration: 60,
    totalMarks: 50,
    passingMarks: 20,
    status: 'Published'
  };
  
  console.log('✅ Dummy exam object created:', dummyExam);
  console.log('🎉 Basic test completed successfully!');
} catch (error) {
  console.error('❌ Error in simple test:', error);
}

console.log('✅ Script execution completed'); 