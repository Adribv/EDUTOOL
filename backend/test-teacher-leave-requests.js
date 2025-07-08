const mongoose = require('mongoose');
const TeacherLeaveRequest = require('./models/Staff/HOD/teacherLeaveRequest.model');
const Staff = require('./models/Staff/staffModel');

async function testTeacherLeaveRequests() {
  try {
    // Connect to database
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if there are any teacher leave requests
    const leaveRequests = await TeacherLeaveRequest.find()
      .populate('teacherId', 'name email role department')
      .sort({ createdAt: -1 });

    console.log(`\n📋 Found ${leaveRequests.length} teacher leave requests:`);
    
    if (leaveRequests.length === 0) {
      console.log('❌ No teacher leave requests found in database');
      
      // Check if there are any teachers
      const teachers = await Staff.find({ role: 'Teacher' }).select('name email role department');
      console.log(`\n👨‍🏫 Found ${teachers.length} teachers in database:`);
      
      if (teachers.length > 0) {
        console.log('Available teachers:');
        teachers.forEach((teacher, index) => {
          console.log(`${index + 1}. ${teacher.name} (${teacher.email}) - ${teacher.department || 'No department'}`);
        });
        
        console.log('\n💡 To test the system, you can:');
        console.log('1. Login as a teacher');
        console.log('2. Go to Teacher Dashboard > Teacher\'s Leave tab');
        console.log('3. Submit a leave request');
        console.log('4. Then check the principal dashboard');
      } else {
        console.log('❌ No teachers found in database');
      }
    } else {
      console.log('Teacher leave requests:');
      leaveRequests.forEach((request, index) => {
        console.log(`\n${index + 1}. Leave Request ID: ${request._id}`);
        console.log(`   Teacher: ${request.teacherId?.name || 'Unknown'} (${request.teacherId?.email || 'No email'})`);
        console.log(`   Leave Type: ${request.leaveType}`);
        console.log(`   Start Date: ${request.startDate}`);
        console.log(`   End Date: ${request.endDate}`);
        console.log(`   Status: ${request.status}`);
        console.log(`   Reason: ${request.reason}`);
        console.log(`   Created: ${request.createdAt}`);
        
        if (request.processedBy) {
          console.log(`   Processed By: ${request.processedBy}`);
          console.log(`   Processed At: ${request.processedAt}`);
        }
        
        if (request.hodComments) {
          console.log(`   HOD Comments: ${request.hodComments}`);
        }
      });
    }

    // Test the principal API endpoint
    console.log('\n🔍 Testing principal API endpoint...');
    
    // Simulate the principal controller function
    const principalLeaveRequests = await TeacherLeaveRequest.find()
      .populate('teacherId', 'name email role department contactNumber')
      .sort({ createdAt: -1 });
    
    console.log(`Principal API would return ${principalLeaveRequests.length} leave requests`);
    
    if (principalLeaveRequests.length > 0) {
      console.log('Sample data that would be sent to frontend:');
      console.log(JSON.stringify(principalLeaveRequests[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testTeacherLeaveRequests(); 