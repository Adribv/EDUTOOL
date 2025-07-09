const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const Student = require('./models/Student/studentModel');
const MCQAssignment = require('./models/Staff/Teacher/mcqAssignment.model');
const Staff = require('./models/Staff/staffModel');

async function testStudentMCQAPI() {
  try {
    console.log('Testing Student MCQ API...\n');
    
    // Get a student with class 12, section C
    const student = await Student.findOne({ 
      class: '12', 
      section: 'C',
      status: 'Active'
    });
    
    if (!student) {
      console.log('❌ No active student found with class 12, section C');
      return;
    }
    
    console.log(`✅ Found student: ${student.name} (${student.email})`);
    console.log(`   Class: ${student.class}, Section: ${student.section}\n`);
    
    // Get all active MCQ assignments
    const allAssignments = await MCQAssignment.find({
      status: 'Active'
    }).populate('createdBy', 'name email');
    
    console.log(`Total active MCQ assignments: ${allAssignments.length}`);
    allAssignments.forEach(assignment => {
      console.log(`  - ${assignment.title} (Class: ${assignment.class}, Section: ${assignment.section})`);
    });
    
    // Test the flexible class matching logic
    console.log('\nTesting flexible class matching...');
    
    // Helper function to normalize class formats for comparison
    const normalizeClass = (classValue) => {
      if (!classValue) return '';
      
      // Remove any non-alphanumeric characters and convert to string
      const cleanClass = String(classValue).replace(/[^a-zA-Z0-9]/g, '');
      
      // Extract numeric part (grade) and alphabetic part (section)
      const gradeMatch = cleanClass.match(/^(\d+)/);
      const sectionMatch = cleanClass.match(/([A-Za-z]+)$/);
      
      return {
        grade: gradeMatch ? gradeMatch[1] : '',
        section: sectionMatch ? sectionMatch[1].toUpperCase() : ''
      };
    };
    
    // Helper function to check if classes match
    const classesMatch = (studentClass, assignmentClass, studentSection, assignmentSection) => {
      const studentNormalized = normalizeClass(studentClass);
      const assignmentNormalized = normalizeClass(assignmentClass);
      
      // Direct match
      if (studentClass === assignmentClass && studentSection === assignmentSection) {
        return true;
      }
      
      // Flexible matching: if student class is "12C" and assignment is "12" + "C"
      if (studentNormalized.grade === assignmentNormalized.grade && 
          (studentNormalized.section === assignmentSection || 
           studentSection === assignmentNormalized.section)) {
        return true;
      }
      
      // Flexible matching: if assignment class is "12C" and student is "12" + "C"
      if (assignmentNormalized.grade === studentNormalized.grade && 
          (assignmentNormalized.section === studentSection || 
           assignmentSection === studentNormalized.section)) {
        return true;
      }
      
      return false;
    };
    
    // Filter assignments that match the student's class
    const matchingAssignments = allAssignments.filter(assignment => 
      classesMatch(student.class, assignment.class, student.section, assignment.section)
    );
    
    console.log(`\nMatching assignments for student ${student.name}:`);
    if (matchingAssignments.length === 0) {
      console.log('❌ No matching assignments found');
      
      // Show why no matches
      console.log('\nDebugging why no matches:');
      allAssignments.forEach(assignment => {
        const matches = classesMatch(student.class, assignment.class, student.section, assignment.section);
        console.log(`  Assignment: ${assignment.title}`);
        console.log(`    Student: ${student.class}-${student.section}`);
        console.log(`    Assignment: ${assignment.class}-${assignment.section}`);
        console.log(`    Matches: ${matches ? '✅' : '❌'}`);
        console.log('');
      });
    } else {
      console.log(`✅ Found ${matchingAssignments.length} matching assignments:`);
      matchingAssignments.forEach(assignment => {
        console.log(`  - ${assignment.title} (Class: ${assignment.class}, Section: ${assignment.section})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing student MCQ API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testStudentMCQAPI(); 