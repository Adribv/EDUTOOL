const mongoose = require('mongoose');

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
    const Student = require('./models/Student/studentModel');
    const LeaveRequest = require('./models/Student/leaveRequestModel');

    console.log('Adding leave requests for class 12C students...');

    // Find students in class 12C
    const students = await Student.find({
      class: '12',
      section: 'C'
    });

    console.log(`Found ${students.length} students in class 12C:`);
    students.forEach(student => {
      console.log(`- ${student.name} (${student.studentId})`);
    });

    if (students.length === 0) {
      console.log('No students found in class 12C');
      return;
    }

    // Create leave requests for each student
    const leaveRequests = [];
    
    for (const student of students) {
      // Create multiple leave requests for each student
      const studentLeaveRequests = [
        {
          studentId: student._id,
          class: student.class,
          section: student.section,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          reason: 'Medical appointment with doctor',
          type: 'Medical',
          status: 'Pending'
        },
        {
          studentId: student._id,
          class: student.class,
          section: student.section,
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          reason: 'Family function - cousin wedding',
          type: 'Personal',
          status: 'Approved'
        },
        {
          studentId: student._id,
          class: student.class,
          section: student.section,
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          reason: 'Sports competition - inter-school tournament',
          type: 'Other',
          status: 'Rejected'
        },
        {
          studentId: student._id,
          class: student.class,
          section: student.section,
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          reason: 'Dental checkup',
          type: 'Medical',
          status: 'Approved'
        }
      ];
      
      leaveRequests.push(...studentLeaveRequests);
    }

    // Insert all leave requests
    const createdLeaveRequests = await LeaveRequest.insertMany(leaveRequests);
    
    console.log(`✅ Created ${createdLeaveRequests.length} leave requests for class 12C students`);
    
    // Show summary
    console.log('\nLeave Requests Summary:');
    for (const student of students) {
      const studentRequests = createdLeaveRequests.filter(req => req.studentId.toString() === student._id.toString());
      console.log(`\n${student.name} (${student.studentId}):`);
      studentRequests.forEach(request => {
        console.log(`  - ${request.status}: ${request.type} (${request.reason})`);
      });
    }

    console.log('\n🎉 Leave requests added successfully!');
    console.log('Now refresh the teacher dashboard to see the leave requests.');

  } catch (error) {
    console.error('Error adding leave requests:', error);
  } finally {
    mongoose.connection.close();
  }
}); 