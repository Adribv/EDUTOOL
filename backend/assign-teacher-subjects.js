const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const VPExam = require('./models/Staff/HOD/examPaper.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Find the teacher (assuming it's the one with ID 685ac0b4d60acdac26b2f9f1 from the logs)
    const teacherId = '685ac0b4d60acdac26b2f9f1';
    const teacher = await Staff.findById(teacherId);
    
    if (!teacher) {
      console.log('Teacher not found. Creating a sample teacher...');
      
      // Create a sample teacher
      const newTeacher = new Staff({
        name: 'Sample Teacher',
        email: 'teacher@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'Teacher',
        employeeId: 'T001',
        department: 'Mathematics',
        joiningDate: new Date('2020-01-01'),
        contactInfo: {
          phone: '9999999999',
          email: 'teacher@example.com',
          address: 'Teacher Office, School Campus'
        }
      });
      
      await newTeacher.save();
      console.log('Created sample teacher with ID:', newTeacher._id);
      
      // Use the new teacher
      teacher = newTeacher;
    }

    console.log('Found teacher:', teacher.name, 'ID:', teacher._id);

    // Get existing VP exams to see what classes and subjects are available
    const vpExams = await VPExam.find({ status: { $in: ['Approved', 'Published'] } });
    console.log(`Found ${vpExams.length} VP exams`);

    // Extract unique class-subject combinations from VP exams
    const classSubjectCombinations = [];
    vpExams.forEach(exam => {
      const combination = {
        class: exam.class,
        section: exam.section,
        subject: exam.subject
      };
      
      // Check if this combination already exists
      const exists = classSubjectCombinations.some(
        existing => existing.class === combination.class && 
                   existing.section === combination.section && 
                   existing.subject === combination.subject
      );
      
      if (!exists) {
        classSubjectCombinations.push(combination);
      }
    });

    console.log('Available class-subject combinations from VP exams:');
    classSubjectCombinations.forEach((combo, index) => {
      console.log(`${index + 1}. ${combo.class}${combo.section} - ${combo.subject}`);
    });

    // Assign the teacher to some of these classes
    const assignmentsToAdd = [
      { class: '10', section: 'A', subject: 'Mathematics' },
      { class: '9', section: 'B', subject: 'Science' },
      { class: '8', section: 'A', subject: 'English' }
    ];

    console.log('\nAssigning teacher to classes:');
    assignmentsToAdd.forEach(assignment => {
      console.log(`- ${assignment.class}${assignment.section} - ${assignment.subject}`);
    });

    // Check if teacher already has assigned subjects
    if (!teacher.assignedSubjects) {
      teacher.assignedSubjects = [];
    }

    // Add new assignments (avoid duplicates)
    let addedCount = 0;
    assignmentsToAdd.forEach(assignment => {
      const alreadyAssigned = teacher.assignedSubjects.some(
        existing => existing.class === assignment.class && 
                   existing.section === assignment.section && 
                   existing.subject === assignment.subject
      );
      
      if (!alreadyAssigned) {
        teacher.assignedSubjects.push(assignment);
        addedCount++;
        console.log(`✅ Added: ${assignment.class}${assignment.section} - ${assignment.subject}`);
      } else {
        console.log(`⚠️ Already assigned: ${assignment.class}${assignment.section} - ${assignment.subject}`);
      }
    });

    if (addedCount > 0) {
      await teacher.save();
      console.log(`\n✅ Successfully assigned ${addedCount} new subjects to teacher`);
    } else {
      console.log('\n⚠️ No new assignments were needed');
    }

    console.log('\nFinal teacher assignments:');
    teacher.assignedSubjects.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.class}${assignment.section} - ${assignment.subject}`);
    });

    console.log('\n🎉 Teacher subject assignment completed!');
    console.log('The teacher should now be able to see VP-created exams for their assigned classes.');

  } catch (error) {
    console.error('Error assigning teacher subjects:', error);
  } finally {
    mongoose.connection.close();
  }
}); 