const mongoose = require('mongoose');
const ExamPaper = require('./models/Staff/HOD/examPaper.model');
const Department = require('./models/Staff/HOD/department.model');
const Staff = require('./models/Staff/staffModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addSampleVPExams = async () => {
  try {
    console.log('Adding sample VP exam data...');

    // First, create a sample department if it doesn't exist
    let department = await Department.findOne({ name: 'Mathematics' });
    if (!department) {
      department = new Department({
        name: 'Mathematics',
        description: 'Mathematics Department',
        code: 'MATH',
        status: 'Active'
      });
      await department.save();
      console.log('Created Mathematics department');
    }

    // Create a sample VP staff if it doesn't exist
    let vpStaff = await Staff.findOne({ role: 'VicePrincipal' });
    if (!vpStaff) {
      vpStaff = new Staff({
        name: 'Dr. Sarah Johnson',
        email: 'vp@edutool.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'VicePrincipal',
        employeeId: 'VP001',
        department: 'Administration',
        joiningDate: new Date('2020-01-01'),
        contactInfo: {
          phone: '9999999999',
          email: 'vp@edutool.com',
          address: 'VP Office, School Campus'
        }
      });
      await vpStaff.save();
      console.log('Created VP staff');
    }

    // Sample VP exam data
    const sampleExams = [
      {
        departmentId: department._id,
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
          'Use blue or black pen only',
          'Mobile phones are strictly prohibited'
        ],
        status: 'Published',
        createdBy: vpStaff._id
      },
      {
        departmentId: department._id,
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
          'Draw neat diagrams where required',
          'Use pencil for diagrams'
        ],
        status: 'Approved',
        createdBy: vpStaff._id
      },
      {
        departmentId: department._id,
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
          'Check your grammar and spelling',
          'Time management is important'
        ],
        status: 'Published',
        createdBy: vpStaff._id
      },
      {
        departmentId: department._id,
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
          'Provide examples where asked',
          'Manage your time wisely'
        ],
        status: 'Published',
        createdBy: vpStaff._id
      },
      {
        departmentId: department._id,
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
          'Mark only one answer per question',
          'No negative marking'
        ],
        status: 'Approved',
        createdBy: vpStaff._id
      }
    ];

    // Clear existing sample exams
    await ExamPaper.deleteMany({ createdBy: vpStaff._id });

    // Insert sample exams
    const insertedExams = await ExamPaper.insertMany(sampleExams);
    console.log(`Successfully added ${insertedExams.length} sample VP exams`);

    // Log the exams for verification
    insertedExams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.subject} - ${exam.class}${exam.section} - ${exam.examType} - ${exam.examDate.toDateString()}`);
    });

    console.log('Sample VP exam data added successfully!');
  } catch (error) {
    console.error('Error adding sample VP exam data:', error);
  } finally {
    mongoose.connection.close();
  }
};

addSampleVPExams(); 