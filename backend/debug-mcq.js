const mongoose = require('mongoose');
const MCQAssignment = require('./models/Staff/Teacher/mcqAssignment.model');
const Student = require('./models/Student/studentModel');
const Staff = require('./models/Staff/staffModel');

async function debugMCQ() {
  try {
    // Use the same MongoDB Atlas connection string as the main app
    const mongoURI = 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      heartbeatFrequencyMS: 10000,
      bufferCommands: true,
    });
    
    console.log('Connected to MongoDB Atlas');

    console.log('\n=== MCQ ASSIGNMENTS ===');
    const assignments = await MCQAssignment.find({}).populate('createdBy', 'name email');
    console.log('Total MCQ assignments:', assignments.length);
    
    if (assignments.length === 0) {
      console.log('No MCQ assignments found in database');
    } else {
      assignments.forEach((a, i) => {
        console.log(`${i+1}. ${a.title} - Class: ${a.class}${a.section} - Subject: ${a.subject} - Status: ${a.status} - Created by: ${a.createdBy?.name || 'Unknown'}`);
      });
    }

    console.log('\n=== STUDENTS ===');
    const students = await Student.find({}).limit(5);
    console.log('Sample students:');
    students.forEach(s => console.log(`- ${s.name} - Class: ${s.class}${s.section}`));

    console.log('\n=== TEACHERS ===');
    const teachers = await Staff.find({role: 'Teacher'}).limit(5);
    console.log('Sample teachers:');
    teachers.forEach(t => console.log(`- ${t.name} - ID: ${t._id}`));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

debugMCQ(); 