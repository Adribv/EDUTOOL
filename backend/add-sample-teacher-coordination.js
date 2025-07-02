const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Class = require('./models/Admin/classModel');
const Student = require('./models/Student/studentModel');
const LeaveRequest = require('./models/Student/leaveRequestModel');

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
    // Find existing teachers
    const teachers = await Staff.find({ role: 'Teacher' }).limit(3);
    
    if (teachers.length === 0) {
      console.log('No teachers found. Please run the sample data script first.');
      return;
    }

    console.log(`Found ${teachers.length} teachers`);

    // Create or update classes with coordinators
    const classes = await Class.insertMany([
      {
        name: 'Class 10A',
        grade: '10',
        section: 'A',
        coordinator: teachers[0]._id,
        capacity: 40,
        description: 'Class 10 Section A'
      },
      {
        name: 'Class 10B',
        grade: '10',
        section: 'B',
        coordinator: teachers[1]._id,
        capacity: 40,
        description: 'Class 10 Section B'
      },
      {
        name: 'Class 9A',
        grade: '9',
        section: 'A',
        coordinator: teachers[2]._id,
        capacity: 40,
        description: 'Class 9 Section A'
      }
    ], { ordered: false });

    console.log('Created/updated classes with coordinators');

    // Update teachers to include coordinator references
    await Promise.all(teachers.map(async (teacher, index) => {
      if (classes[index]) {
        teacher.coordinator = [classes[index]._id];
        await teacher.save();
        console.log(`Updated teacher ${teacher.name} as coordinator for ${classes[index].name}`);
      }
    }));

    // Create additional leave requests for testing
    const students = await Student.find({ class: { $in: ['10', '9'] } }).limit(5);
    
    if (students.length > 0) {
      const additionalLeaveRequests = await LeaveRequest.insertMany([
        {
          studentId: students[0]._id,
          class: students[0].class,
          section: students[0].section,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          reason: 'Medical appointment',
          type: 'Medical',
          status: 'Pending'
        },
        {
          studentId: students[1]?._id || students[0]._id,
          class: students[1]?.class || students[0].class,
          section: students[1]?.section || students[0].section,
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          reason: 'Family function',
          type: 'Personal',
          status: 'Approved'
        },
        {
          studentId: students[2]?._id || students[0]._id,
          class: students[2]?.class || students[0].class,
          section: students[2]?.section || students[0].section,
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          reason: 'Sports competition',
          type: 'Other',
          status: 'Rejected'
        }
      ]);

      console.log(`Created ${additionalLeaveRequests.length} additional leave requests`);
    }

    console.log('Teacher coordination setup completed successfully!');
    console.log('\nTeachers can now see leave requests from their coordinated students.');
    console.log('\nSample teacher login credentials:');
    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. Email: ${teacher.email}`);
      console.log(`   Password: password123`);
      console.log(`   Coordinating: ${classes[index]?.name || 'No class assigned'}`);
    });

  } catch (error) {
    console.error('Error setting up teacher coordination:', error);
  } finally {
    mongoose.connection.close();
  }
}); 