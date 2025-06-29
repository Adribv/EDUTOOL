const mongoose = require('mongoose');
const ExamPaper = require('./models/Staff/HOD/examPaper.model');

// Use the same MongoDB Atlas connection as the main app
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://edurays:edurays123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/edurays?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';

const testExamAPI = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create dummy ObjectIds for required fields
    const dummyDepartmentId = new mongoose.Types.ObjectId();
    const dummyCreatedBy = new mongoose.Types.ObjectId();

    // Create a simple exam
    const examData = {
      departmentId: dummyDepartmentId,
      createdBy: dummyCreatedBy,
      subject: 'Mathematics',
      class: '10',
      section: 'A',
      examType: 'MidTerm',
      examDate: new Date('2024-12-20'),
      duration: 180,
      totalMarks: 100,
      passingMarks: 40,
      instructions: ['Read all questions carefully'],
      status: 'Published'
    };

    console.log('📝 Creating exam...');
    const exam = await ExamPaper.create(examData);
    console.log('✅ Exam created:', exam._id);

    // Test the query that the API uses
    console.log('🔍 Testing query...');
    const exams = await ExamPaper.find({ 
      status: { $in: ['Approved', 'Published'] }
    });
    console.log(`✅ Found ${exams.length} published exams`);

    // Display exam details
    exams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.subject} - ${exam.class}${exam.section} - ${exam.examType} - Status: ${exam.status}`);
    });

    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

testExamAPI(); 