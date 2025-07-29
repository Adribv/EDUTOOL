const mongoose = require('mongoose');
const TeacherRemarks = require('./models/teacherRemarks.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if data already exists
      const count = await TeacherRemarks.countDocuments();
      console.log('Current teacher remarks count:', count);
      
      if (count === 0) {
        console.log('No teacher remarks found. Creating sample data...');
        
        const sampleData = [
          {
            class: '7',
            section: 'A',
            subject: 'Mathematics',
            teacherName: 'John Smith',
            teacherId: '507f1f77bcf86cd799439011',
            unitChapter: 'Algebra Basics',
            startDate: new Date('2024-01-15'),
            plannedCompletionDate: new Date('2024-02-15'),
            numberOfPeriodsAllotted: 20,
            teachingMethodUsed: 'Interactive Learning',
            academicYear: '2024-2025',
            semester: 'First Term',
            status: 'In Progress',
            numberOfPeriodsTaken: 12,
            completionRate: 60,
            remarksTopicsLeft: 'Quadratic equations need more practice'
          },
          {
            class: '8',
            section: 'B',
            subject: 'Science',
            teacherName: 'Sarah Johnson',
            teacherId: '507f1f77bcf86cd799439011',
            unitChapter: 'Chemical Reactions',
            startDate: new Date('2024-01-20'),
            plannedCompletionDate: new Date('2024-02-20'),
            numberOfPeriodsAllotted: 15,
            teachingMethodUsed: 'Laboratory Experiments',
            academicYear: '2024-2025',
            semester: 'First Term',
            status: 'Completed',
            numberOfPeriodsTaken: 15,
            actualCompletionDate: new Date('2024-02-18'),
            completionRate: 100,
            teacherRemarks: 'Students showed excellent understanding of chemical reactions. Lab experiments were very successful.',
            studentPerformance: 'Excellent',
            classParticipation: 'Very Active',
            homeworkCompletion: 'Always Complete',
            understandingLevel: 'Excellent',
            formStatus: 'Submitted'
          },
          {
            class: '9',
            section: 'C',
            subject: 'English',
            teacherName: 'Michael Brown',
            teacherId: '507f1f77bcf86cd799439011',
            unitChapter: 'Shakespeare Literature',
            startDate: new Date('2024-01-10'),
            plannedCompletionDate: new Date('2024-02-10'),
            numberOfPeriodsAllotted: 18,
            teachingMethodUsed: 'Discussion and Analysis',
            academicYear: '2024-2025',
            semester: 'First Term',
            status: 'Delayed',
            numberOfPeriodsTaken: 8,
            completionRate: 44,
            remarksTopicsLeft: 'Need to cover Macbeth analysis and character development',
            teacherRemarks: 'Students are struggling with Shakespearean language. Need more time for comprehension.',
            studentPerformance: 'Average',
            classParticipation: 'Moderate',
            homeworkCompletion: 'Sometimes Complete',
            understandingLevel: 'Below Average',
            areasOfConcern: 'Difficulty understanding Elizabethan English',
            suggestionsForImprovement: 'Provide more context and modern translations',
            formStatus: 'Draft'
          }
        ];
        
        await TeacherRemarks.insertMany(sampleData);
        console.log('Sample data created successfully!');
      } else {
        console.log('Teacher remarks data already exists.');
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
      console.log('Database connection closed');
    }
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  }); 