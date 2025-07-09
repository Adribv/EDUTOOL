const mongoose = require('mongoose');
const MCQAssignment = require('./models/Staff/Teacher/mcqAssignment.model');
const Student = require('./models/Student/studentModel');
const Staff = require('./models/Staff/staffModel');

async function debugMCQ() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edulives');
    console.log('Connected to database');

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