const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student/studentModel');
const Timetable = require('./models/Academic/timetableModel');
const Assignment = require('./models/Staff/Teacher/assignment.model');
const Homework = require('./models/Staff/Teacher/homework.model');
const Exam = require('./models/Staff/Teacher/exam.model');
const ExamResult = require('./models/Staff/Teacher/examResult.model');
const Announcement = require('./models/Communication/announcementModel');
const Message = require('./models/Communication/messageModel');
const Attendance = require('./models/Staff/Teacher/attendance.model');
const LeaveRequest = require('./models/Student/leaveRequestModel');
const FeeStructure = require('./models/Finance/feeStructureModel');
const FeePayment = require('./models/Finance/feePaymentModel');
const LearningResource = require('./models/Staff/Teacher/lessonplan.model');
const Staff = require('./models/Staff/staffModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Clear existing data
    await Student.deleteMany({});
    await Timetable.deleteMany({});
    await Assignment.deleteMany({});
    await Homework.deleteMany({});
    await Exam.deleteMany({});
    await ExamResult.deleteMany({});
    await Announcement.deleteMany({});
    await Message.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    await FeeStructure.deleteMany({});
    await FeePayment.deleteMany({});
    await LearningResource.deleteMany({});
    
    console.log('Cleared existing data');

    // Create sample teachers/staff
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const teachers = await Staff.insertMany([
      {
        name: 'Mr. John Smith',
        email: 'john.smith@school.com',
        password: hashedPassword,
        role: 'Teacher',
        department: 'Mathematics',
        phone: '1234567890',
        address: '123 Teacher St, City',
        joiningDate: new Date('2020-01-15'),
        isActive: true
      },
      {
        name: 'Ms. Jane Doe',
        email: 'jane.doe@school.com',
        password: hashedPassword,
        role: 'Teacher',
        department: 'Science',
        phone: '1234567891',
        address: '456 Teacher Ave, City',
        joiningDate: new Date('2020-02-01'),
        isActive: true
      },
      {
        name: 'Mrs. Emily Johnson',
        email: 'emily.johnson@school.com',
        password: hashedPassword,
        role: 'Teacher',
        department: 'English',
        phone: '1234567892',
        address: '789 Teacher Blvd, City',
        joiningDate: new Date('2020-01-20'),
        isActive: true
      }
    ]);

    console.log('Created teachers');

    // Create sample students
    const students = await Student.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@student.com',
        password: hashedPassword,
        studentId: 'STU001',
        rollNumber: '001',
        class: '10',
        section: 'A',
        dateOfBirth: new Date('2006-05-15'),
        gender: 'Female',
        phone: '9876543210',
        address: '123 Student St, City',
        parentName: 'Mr. Robert Johnson',
        parentPhone: '9876543211',
        parentEmail: 'robert.johnson@email.com',
        admissionDate: new Date('2020-06-01'),
        isActive: true
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@student.com',
        password: hashedPassword,
        studentId: 'STU002',
        rollNumber: '002',
        class: '10',
        section: 'A',
        dateOfBirth: new Date('2006-08-20'),
        gender: 'Male',
        phone: '9876543212',
        address: '456 Student Ave, City',
        parentName: 'Mrs. Sarah Smith',
        parentPhone: '9876543213',
        parentEmail: 'sarah.smith@email.com',
        admissionDate: new Date('2020-06-01'),
        isActive: true
      }
    ]);

    console.log('Created students');

    // Create timetable
    const timetable = new Timetable({
      class: '10',
      section: 'A',
      academicYear: '2024-25',
      schedule: [
        {
          day: 'Monday',
          periods: [
            { time: '08:00-09:00', subject: 'Mathematics', teacher: 'Mr. John Smith', room: '101' },
            { time: '09:00-10:00', subject: 'Science', teacher: 'Ms. Jane Doe', room: '102' },
            { time: '10:00-11:00', subject: 'English', teacher: 'Mrs. Emily Johnson', room: '103' },
            { time: '11:00-11:15', subject: 'Break', teacher: '', room: '' },
            { time: '11:15-12:15', subject: 'Mathematics', teacher: 'Mr. John Smith', room: '101' },
            { time: '12:15-13:15', subject: 'Science', teacher: 'Ms. Jane Doe', room: '102' }
          ]
        },
        {
          day: 'Tuesday',
          periods: [
            { time: '08:00-09:00', subject: 'English', teacher: 'Mrs. Emily Johnson', room: '103' },
            { time: '09:00-10:00', subject: 'Mathematics', teacher: 'Mr. John Smith', room: '101' },
            { time: '10:00-11:00', subject: 'Science', teacher: 'Ms. Jane Doe', room: '102' },
            { time: '11:00-11:15', subject: 'Break', teacher: '', room: '' },
            { time: '11:15-12:15', subject: 'English', teacher: 'Mrs. Emily Johnson', room: '103' },
            { time: '12:15-13:15', subject: 'Mathematics', teacher: 'Mr. John Smith', room: '101' }
          ]
        }
      ]
    });

    await timetable.save();
    console.log('Created timetable');

    // Create assignments
    const assignments = await Assignment.insertMany([
      {
        title: 'Algebra Problem Set',
        description: 'Complete problems 1-20 in Chapter 3',
        subject: 'Mathematics',
        class: '10',
        section: 'A',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxMarks: 20,
        createdBy: teachers[0]._id,
        status: 'Active',
        allowLateSubmission: true
      },
      {
        title: 'Science Lab Report',
        description: 'Write a report on the chemistry experiment',
        subject: 'Science',
        class: '10',
        section: 'A',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        maxMarks: 15,
        createdBy: teachers[1]._id,
        status: 'Active',
        allowLateSubmission: false
      },
      {
        title: 'Essay Writing',
        description: 'Write a 500-word essay on Shakespeare',
        subject: 'English',
        class: '10',
        section: 'A',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        maxMarks: 25,
        createdBy: teachers[2]._id,
        status: 'Completed',
        allowLateSubmission: false
      }
    ]);

    console.log('Created assignments');

    // Create homework
    const homework = await Homework.insertMany([
      {
        title: 'Math Practice Problems',
        description: 'Complete exercises 1-10 from textbook',
        subject: 'Mathematics',
        class: '10',
        section: 'A',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        teacherId: teachers[0]._id,
        isActive: true
      },
      {
        title: 'Science Reading Assignment',
        description: 'Read Chapter 5 and answer questions',
        subject: 'Science',
        class: '10',
        section: 'A',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        teacherId: teachers[1]._id,
        isActive: true
      }
    ]);

    console.log('Created homework');

    // Create exams
    const exams = await Exam.insertMany([
      {
        title: 'Mid-Term Mathematics',
        subject: 'Mathematics',
        class: '10',
        section: 'A',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        duration: 120,
        maxMarks: 100,
        venue: 'Hall A',
        instructions: 'Bring calculator and writing materials',
        createdBy: teachers[0]._id,
        status: 'Scheduled',
        admitCardsAvailable: true
      },
      {
        title: 'Science Unit Test',
        subject: 'Science',
        class: '10',
        section: 'A',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        duration: 90,
        maxMarks: 50,
        venue: 'Room 102',
        instructions: 'No calculators allowed',
        createdBy: teachers[1]._id,
        status: 'Scheduled',
        admitCardsAvailable: true
      }
    ]);

    console.log('Created exams');

    // Create exam results
    const examResults = await ExamResult.insertMany([
      {
        examId: exams[0]._id,
        studentId: students[0]._id,
        score: 85,
        maxMarks: 100,
        grade: 'A',
        remarks: 'Excellent work!',
        gradedBy: teachers[0]._id,
        gradedAt: new Date()
      },
      {
        examId: exams[0]._id,
        studentId: students[1]._id,
        score: 78,
        maxMarks: 100,
        grade: 'B+',
        remarks: 'Good work, needs improvement in algebra',
        gradedBy: teachers[0]._id,
        gradedAt: new Date()
      }
    ]);

    console.log('Created exam results');

    // Create announcements
    const announcements = await Announcement.insertMany([
      {
        title: 'School Sports Day',
        content: 'Annual sports day will be held on December 15th',
        targetAudience: 'All Students',
        isPublished: true,
        createdBy: teachers[0]._id
      },
      {
        title: 'Mathematics Competition',
        content: 'Inter-school mathematics competition registration open',
        targetAudience: 'Specific Class',
        targetClass: '10',
        targetSection: 'A',
        isPublished: true,
        createdBy: teachers[0]._id
      }
    ]);

    console.log('Created announcements');

    // Create messages
    const messages = await Message.insertMany([
      {
        senderId: teachers[0]._id,
        senderModel: 'Staff',
        recipientId: students[0]._id,
        recipientModel: 'Student',
        subject: 'Assignment Reminder',
        content: 'Please submit your mathematics assignment by Friday',
        isRead: false
      },
      {
        senderId: teachers[1]._id,
        senderModel: 'Staff',
        recipientId: students[0]._id,
        recipientModel: 'Student',
        subject: 'Lab Schedule',
        content: 'Your science lab is scheduled for tomorrow at 2 PM',
        isRead: true
      }
    ]);

    console.log('Created messages');

    // Create attendance records
    const attendanceRecords = await Attendance.insertMany([
      {
        date: new Date(),
        class: '10',
        section: 'A',
        attendanceData: [
          { studentRollNumber: '001', status: 'present', remarks: '' },
          { studentRollNumber: '002', status: 'present', remarks: '' }
        ]
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        class: '10',
        section: 'A',
        attendanceData: [
          { studentRollNumber: '001', status: 'present', remarks: '' },
          { studentRollNumber: '002', status: 'absent', remarks: 'Sick leave' }
        ]
      }
    ]);

    console.log('Created attendance records');

    // Create leave requests
    const leaveRequests = await LeaveRequest.insertMany([
      {
        studentId: students[0]._id,
        class: '10',
        section: 'A',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        reason: 'Family function',
        type: 'Personal',
        status: 'Pending'
      }
    ]);

    console.log('Created leave requests');

    // Create fee structure
    const feeStructure = new FeeStructure({
      class: '10',
      academicYear: '2024-25',
      components: [
        { name: 'Tuition Fee', amount: 5000, frequency: 'Monthly' },
        { name: 'Library Fee', amount: 500, frequency: 'Yearly' },
        { name: 'Laboratory Fee', amount: 1000, frequency: 'Yearly' }
      ],
      totalAmount: 6500
    });

    await feeStructure.save();
    console.log('Created fee structure');

    // Create fee payments
    const feePayments = await FeePayment.insertMany([
      {
        studentId: students[0]._id,
        amount: 5000,
        paymentMethod: 'Online',
        transactionId: 'TXN001',
        academicYear: '2024-25',
        term: 'First Term',
        components: [{ name: 'Tuition Fee', amount: 5000 }],
        receiptNumber: 'RCP001',
        date: new Date()
      }
    ]);

    console.log('Created fee payments');

    // Create learning resources
    const learningResources = await LearningResource.insertMany([
      {
        title: 'Algebra Fundamentals',
        subject: 'Mathematics',
        class: '10',
        description: 'Complete guide to algebra basics',
        content: 'This lesson covers the fundamental concepts of algebra...',
        isPublished: true,
        createdBy: teachers[0]._id,
        viewCount: 0
      },
      {
        title: 'Chemistry Basics',
        subject: 'Science',
        class: '10',
        description: 'Introduction to chemistry concepts',
        content: 'This lesson covers basic chemistry concepts...',
        isPublished: true,
        createdBy: teachers[1]._id,
        viewCount: 0
      }
    ]);

    console.log('Created learning resources');

    console.log('Sample student data created successfully!');
    console.log('\nSample student login credentials:');
    console.log('Email: alice.johnson@student.com');
    console.log('Password: password123');
    console.log('\nEmail: bob.smith@student.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
}); 