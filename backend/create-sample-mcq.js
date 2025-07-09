const mongoose = require('mongoose');
const MCQAssignment = require('./models/Staff/Teacher/mcqAssignment.model');
const Staff = require('./models/Staff/staffModel');

async function createSampleMCQ() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edulives');
    console.log('Connected to database');

    // Find a teacher to assign as creator
    const teacher = await Staff.findOne({ role: 'Teacher' });
    if (!teacher) {
      console.log('No teacher found. Creating MCQ assignment without creator...');
    }

    // Create sample MCQ assignment
    const sampleMCQ = new MCQAssignment({
      title: 'Sample Mathematics Quiz',
      description: 'A basic mathematics quiz covering algebra and geometry',
      instructions: 'Answer all questions. Each question carries 1 point.',
      class: '12',
      section: 'C',
      subject: 'Mathematics',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxMarks: 100,
      timeLimit: 30, // 30 minutes
      allowReview: true,
      showResults: true,
      randomizeQuestions: false,
      randomizeOptions: false,
      status: 'Active',
      createdBy: teacher ? teacher._id : null,
      questions: [
        {
          question: 'What is the value of x in the equation 2x + 5 = 13?',
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
            { text: '6', isCorrect: false }
          ],
          points: 1,
          explanation: '2x + 5 = 13, so 2x = 8, therefore x = 4'
        },
        {
          question: 'What is the area of a circle with radius 5 units?',
          options: [
            { text: '25π', isCorrect: false },
            { text: '50π', isCorrect: false },
            { text: '75π', isCorrect: false },
            { text: '25π', isCorrect: true }
          ],
          points: 1,
          explanation: 'Area = πr² = π(5)² = 25π'
        },
        {
          question: 'Solve for y: 3y - 7 = 8',
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: false },
            { text: '5', isCorrect: true },
            { text: '6', isCorrect: false }
          ],
          points: 1,
          explanation: '3y - 7 = 8, so 3y = 15, therefore y = 5'
        }
      ]
    });

    await sampleMCQ.save();
    console.log('Sample MCQ assignment created successfully!');
    console.log('Assignment ID:', sampleMCQ._id);
    console.log('Title:', sampleMCQ.title);
    console.log('Class:', sampleMCQ.class + sampleMCQ.section);
    console.log('Subject:', sampleMCQ.subject);
    console.log('Questions:', sampleMCQ.questions.length);

  } catch (err) {
    console.error('Error creating sample MCQ:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

createSampleMCQ(); 