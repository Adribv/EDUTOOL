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

    console.log('=== CHECKING EXISTING LEAVE REQUESTS ===');

    // 1. Find students in class 12C
    console.log('\n1. Students in class 12C:');
    const students = await Student.find({
      class: '12',
      section: 'C'
    });

    console.log(`Found ${students.length} students:`);
    students.forEach(student => {
      console.log(`- ${student.name} (ID: ${student._id}) - ${student.studentId}`);
    });

    if (students.length === 0) {
      console.log('No students found in class 12C');
      return;
    }

    // 2. Check ALL leave requests in the system
    console.log('\n2. ALL leave requests in the system:');
    const allLeaveRequests = await LeaveRequest.find().populate('studentId', 'name class section studentId');
    console.log(`Total leave requests: ${allLeaveRequests.length}`);

    allLeaveRequests.forEach((request, index) => {
      console.log(`\nLeave Request ${index + 1}:`);
      console.log(`  ID: ${request._id}`);
      console.log(`  Student ID: ${request.studentId}`);
      console.log(`  Student Name: ${request.studentId?.name || 'Unknown'}`);
      console.log(`  Student Class: ${request.studentId?.class || 'N/A'}${request.studentId?.section || 'N/A'}`);
      console.log(`  Student ID Field: ${request.studentId?.studentId || 'N/A'}`);
      console.log(`  Status: ${request.status}`);
      console.log(`  Type: ${request.type}`);
      console.log(`  Reason: ${request.reason}`);
      console.log(`  Start Date: ${request.startDate}`);
      console.log(`  End Date: ${request.endDate}`);
    });

    // 3. Check leave requests specifically for class 12C students
    console.log('\n3. Leave requests for class 12C students:');
    const studentIds = students.map(student => student._id);
    console.log('Looking for students with IDs:', studentIds);

    const class12CLeaveRequests = await LeaveRequest.find({
      studentId: { $in: studentIds }
    }).populate('studentId', 'name class section studentId');

    console.log(`Found ${class12CLeaveRequests.length} leave requests for class 12C students:`);
    class12CLeaveRequests.forEach((request, index) => {
      console.log(`\nClass 12C Leave Request ${index + 1}:`);
      console.log(`  Student: ${request.studentId?.name} (${request.studentId?.studentId})`);
      console.log(`  Class: ${request.studentId?.class}${request.studentId?.section}`);
      console.log(`  Status: ${request.status}`);
      console.log(`  Type: ${request.type}`);
      console.log(`  Reason: ${request.reason}`);
    });

    // 4. Check if there are leave requests with different student ID formats
    console.log('\n4. Checking for leave requests with different student references:');
    
    // Check by student name
    const byNameRequests = await LeaveRequest.find({
      'studentId.name': { $in: students.map(s => s.name) }
    }).populate('studentId', 'name class section studentId');
    
    console.log(`Leave requests found by student name: ${byNameRequests.length}`);

    // Check by student ID field
    const byStudentIdRequests = await LeaveRequest.find({
      'studentId.studentId': { $in: students.map(s => s.studentId) }
    }).populate('studentId', 'name class section studentId');
    
    console.log(`Leave requests found by student ID field: ${byStudentIdRequests.length}`);

    // 5. Check the exact query that the teacher API uses
    console.log('\n5. Testing the exact teacher API query:');
    const teacherQuery = {
      $or: [{ class: '12', section: 'C' }]
    };
    
    const teacherQueryStudents = await Student.find(teacherQuery);
    console.log(`Students found by teacher query: ${teacherQueryStudents.length}`);
    teacherQueryStudents.forEach(student => {
      console.log(`  - ${student.name} (${student._id})`);
    });

    const teacherQueryStudentIds = teacherQueryStudents.map(student => student._id);
    const teacherQueryLeaveRequests = await LeaveRequest.find({
      studentId: { $in: teacherQueryStudentIds }
    }).populate('studentId', 'name class section studentId');

    console.log(`Leave requests found by teacher query: ${teacherQueryLeaveRequests.length}`);

    // 6. Check for any orphaned leave requests
    console.log('\n6. Checking for orphaned leave requests (no student reference):');
    const orphanedRequests = await LeaveRequest.find({
      studentId: { $exists: false }
    });
    console.log(`Orphaned leave requests: ${orphanedRequests.length}`);

    const nullStudentRequests = await LeaveRequest.find({
      studentId: null
    });
    console.log(`Leave requests with null studentId: ${nullStudentRequests.length}`);

    console.log('\n=== ANALYSIS COMPLETE ===');

  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    mongoose.connection.close();
  }
}); 