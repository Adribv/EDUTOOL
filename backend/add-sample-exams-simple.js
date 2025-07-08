const mongoose = require('mongoose');
const ExamPaper = require('./models/Staff/HOD/examPaper.model');

// Use the same MongoDB Atlas connection as the main app
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addSampleExams = async () => {
  try {
    console.log('Adding sample exam data...');

    // Create dummy ObjectIds for required fields
    const dummyDepartmentId = new mongoose.Types.ObjectId();
    const dummyCreatedBy = new mongoose.Types.ObjectId();

    // Sample exam data with all required fields
    const sampleExams = [
      {
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
        instructions: [
          'Read all questions carefully before answering',
          'Show all working steps for mathematical problems',
          'Use blue or black pen only'
        ],
        status: 'Published'
      },
      {
        departmentId: dummyDepartmentId,
        createdBy: dummyCreatedBy,
        subject: 'Science',
        class: '9',
        section: 'B',
        examType: 'Final',
        examDate: new Date('2024-12-25'),
        duration: 120,
        totalMarks: 80,
        passingMarks: 32,
        instructions: [
          'Answer all questions',
          'Draw neat diagrams where required'
        ],
        status: 'Approved'
      },
      {
        departmentId: dummyDepartmentId,
        createdBy: dummyCreatedBy,
        subject: 'English',
        class: '8',
        section: 'A',
        examType: 'UnitTest',
        examDate: new Date('2024-12-15'),
        duration: 90,
        totalMarks: 50,
        passingMarks: 20,
        instructions: [
          'Write legibly',
          'Check your grammar and spelling'
        ],
        status: 'Published'
      },
      {
        departmentId: dummyDepartmentId,
        createdBy: dummyCreatedBy,
        subject: 'History',
        class: '7',
        section: 'A',
        examType: 'MidTerm',
        examDate: new Date('2024-12-18'),
        duration: 120,
        totalMarks: 75,
        passingMarks: 30,
        instructions: [
          'Answer in complete sentences',
          'Provide examples where asked'
        ],
        status: 'Published'
      },
      {
        departmentId: dummyDepartmentId,
        createdBy: dummyCreatedBy,
        subject: 'Geography',
        class: '6',
        section: 'B',
        examType: 'Quiz',
        examDate: new Date('2024-12-22'),
        duration: 60,
        totalMarks: 25,
        passingMarks: 10,
        instructions: [
          'Multiple choice questions',
          'Mark only one answer per question'
        ],
        status: 'Approved'
      }
    ];

    // Clear existing exams
    await ExamPaper.deleteMany({});
    console.log('Cleared existing exam data');

    // Insert sample exams
    const insertedExams = await ExamPaper.insertMany(sampleExams);
    console.log(`Successfully added ${insertedExams.length} sample exams`);

    // Log the exams for verification
    insertedExams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.subject} - ${exam.class}${exam.section} - ${exam.examType} - ${exam.examDate.toDateString()}`);
    });

    console.log('Sample exam data added successfully!');
  } catch (error) {
    console.error('Error adding sample exam data:', error);
  } finally {
    mongoose.connection.close();
  }
};

addSampleExams(); 