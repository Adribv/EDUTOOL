const mongoose = require('mongoose');
const Attendance = require('./models/Staff/Teacher/attendance.model');
const Student = require('./models/Student/studentModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Find student with roll number 340
    const student = await Student.findOne({ rollNumber: '340' });
    
    if (!student) {
      console.log('Student with roll number 340 not found. Creating sample student first...');
      
      // Create a sample student if not exists
      const newStudent = new Student({
        name: 'Sample Student 340',
        rollNumber: '340',
        class: '10',
        section: 'A',
        email: 'student340@example.com',
        contactNumber: '9876543210',
        status: 'Active'
      });
      
      await newStudent.save();
      console.log('Created sample student with roll number 340');
    }

    // Create sample attendance records for the last 30 days
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const status = Math.random() > 0.1 ? 'Present' : 'Absent'; // 90% present, 10% absent
        
        attendanceRecords.push({
          class: '10',
          section: 'A',
          date: date,
          attendanceData: [
            {
              studentRollNumber: '340',
              studentName: 'Sample Student 340',
              status: status,
              remarks: status === 'Absent' ? 'Sick leave' : ''
            },
            {
              studentRollNumber: '341',
              studentName: 'Another Student',
              status: 'Present',
              remarks: ''
            }
          ],
          markedBy: null
        });
      }
    }

    // Clear existing attendance records for this student
    await Attendance.deleteMany({ 'attendanceData.studentRollNumber': '340' });
    console.log('Cleared existing attendance records for student 340');

    // Insert new attendance records
    const result = await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${result.length} attendance records for student 340`);

    // Verify the records
    const verification = await Attendance.find({ 'attendanceData.studentRollNumber': '340' });
    console.log(`Verification: Found ${verification.length} attendance records for student 340`);

    console.log('Sample attendance data created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating sample attendance data:', error);
    process.exit(1);
  }
}); 