const mongoose = require('mongoose');
const MCQAssignment = require('./models/Staff/Teacher/mcqAssignment.model');
const MCQSubmission = require('./models/Staff/Teacher/mcqSubmission.model');
const Student = require('./models/Student/studentModel');

async function testMCQStart() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edulives');
    console.log('Connected to database');

    // Check if we have MCQ assignments
    const assignments = await MCQAssignment.find({ status: 'Active' });
    console.log('Active MCQ assignments:', assignments.length);

    if (assignments.length === 0) {
      console.log('No active MCQ assignments found. Please create some first.');
      return;
    }

    // Check if we have students
    const students = await Student.find({}).limit(1);
    console.log('Students found:', students.length);

    if (students.length === 0) {
      console.log('No students found. Please create some first.');
      return;
    }

    const assignment = assignments[0];
    const student = students[0];

    console.log('\nTesting with:');
    console.log('Assignment:', assignment.title, '(ID:', assignment._id + ')');
    console.log('Student:', student.name, '(ID:', student._id + ')');
    console.log('Student Class:', student.class, 'Section:', student.section);
    console.log('Assignment Class:', assignment.class, 'Section:', assignment.section);

    // Test the MCQSubmission model creation
    console.log('\nTesting MCQSubmission creation...');
    const testSubmission = new MCQSubmission({
      assignmentId: assignment._id,
      studentId: student._id,
      status: 'In Progress',
      startedAt: new Date()
    });

    await testSubmission.save();
    console.log('Test submission created successfully:', testSubmission._id);

    // Clean up test submission
    await MCQSubmission.findByIdAndDelete(testSubmission._id);
    console.log('Test submission cleaned up');

    console.log('\nMCQ start functionality test completed successfully!');

  } catch (err) {
    console.error('Error testing MCQ start:', err);
    console.error('Stack trace:', err.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testMCQStart(); 