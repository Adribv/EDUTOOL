const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const TeacherLeaveRequest = require('./models/Staff/HOD/teacherLeaveRequest.model');
const TeacherEvaluation = require('./models/Staff/HOD/teacherEvaluation.model');

// Test database connection
async function testConnection() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI);
    console.log('✅ Database connected successfully');
    
    // Test Staff model
    const staffCount = await Staff.countDocuments();
    console.log(`✅ Staff count: ${staffCount}`);
    
    // Test TeacherLeaveRequest model
    const leaveCount = await TeacherLeaveRequest.countDocuments();
    console.log(`✅ Leave requests count: ${leaveCount}`);
    
    // Test TeacherEvaluation model
    const evalCount = await TeacherEvaluation.countDocuments();
    console.log(`✅ Teacher evaluations count: ${evalCount}`);
    
    // Test getting staff with Teacher/HOD role
    const teachers = await Staff.find({ role: { $in: ['Teacher', 'HOD'] } });
    console.log(`✅ Teachers/HODs found: ${teachers.length}`);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testConnection(); 