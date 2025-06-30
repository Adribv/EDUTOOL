const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Class = require('./models/Admin/classModel');
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
    const teacherId = '685ac0b4d60acdac26b2f9f1';
    console.log('Checking teacher with ID:', teacherId);
    
    // Get teacher details
    const teacher = await Staff.findById(teacherId);
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    
    console.log('✅ Teacher found:', teacher.name);
    console.log('📧 Email:', teacher.email);
    console.log('👤 Role:', teacher.role);
    
    // Check coordinator assignments
    console.log('\n📋 Coordinator assignments:');
    if (teacher.coordinator && teacher.coordinator.length > 0) {
      console.log(`Found ${teacher.coordinator.length} coordinator assignments`);
      
      // Get class details
      const coordinatedClasses = await Class.find({ _id: { $in: teacher.coordinator } });
      console.log('\nCoordinated classes:');
      coordinatedClasses.forEach((cls, index) => {
        console.log(`${index + 1}. ${cls.name} (Grade: ${cls.grade}, Section: ${cls.section})`);
      });
      
      // Check for VP exams that should be visible
      console.log('\n🔍 Checking for VP exams that should be visible:');
      const vpExams = await VPExam.find({ status: { $in: ['Approved', 'Published'] } });
      console.log(`Found ${vpExams.length} total VP exams`);
      
      coordinatedClasses.forEach(cls => {
        const matchingExams = vpExams.filter(exam => 
          exam.class === cls.grade && 
          (exam.section === cls.section || !exam.section)
        );
        
        console.log(`\nFor ${cls.name} (${cls.grade}${cls.section}):`);
        if (matchingExams.length > 0) {
          matchingExams.forEach(exam => {
            console.log(`  ✅ ${exam.subject} - ${exam.examType} (${exam.examDate})`);
          });
        } else {
          console.log(`  ❌ No matching VP exams found`);
        }
      });
      
    } else {
      console.log('❌ No coordinator assignments found');
    }
    
    // Check assigned subjects
    console.log('\n📚 Assigned subjects:');
    if (teacher.assignedSubjects && teacher.assignedSubjects.length > 0) {
      teacher.assignedSubjects.forEach((subject, index) => {
        console.log(`${index + 1}. ${subject.class}${subject.section} - ${subject.subject}`);
      });
    } else {
      console.log('❌ No assigned subjects found');
    }
    
    console.log('\n🎉 Teacher coordination check completed!');
    
  } catch (error) {
    console.error('Error checking teacher coordination:', error);
  } finally {
    mongoose.connection.close();
  }
}); 