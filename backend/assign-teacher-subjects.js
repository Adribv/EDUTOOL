const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulives', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const assignSubjectsToTeachers = async () => {
  try {
    console.log('🔧 Assigning subjects to teachers...');

    // Get all teachers
    const teachers = await Staff.find({ role: 'Teacher' });
    console.log(`Found ${teachers.length} teachers`);

    // Common subjects that teachers typically have
    const commonSubjects = [
      { class: '7', section: 'A', subject: 'Mathematics' },
      { class: '7', section: 'A', subject: 'English' },
      { class: '7', section: 'A', subject: 'Science' },
      { class: '7', section: 'A', subject: 'Social Studies' },
      { class: '8', section: 'A', subject: 'Mathematics' },
      { class: '8', section: 'A', subject: 'English' },
      { class: '8', section: 'A', subject: 'Science' },
      { class: '9', section: 'A', subject: 'Mathematics' },
      { class: '9', section: 'A', subject: 'Physics' },
      { class: '9', section: 'A', subject: 'Chemistry' },
      { class: '10', section: 'A', subject: 'Mathematics' },
      { class: '10', section: 'A', subject: 'Physics' },
      { class: '10', section: 'A', subject: 'Chemistry' },
      { class: '10', section: 'A', subject: 'Biology' }
    ];

    // Assign subjects to each teacher
    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      
      // Assign 2-3 subjects per teacher
      const startIndex = (i * 3) % commonSubjects.length;
      const assignments = commonSubjects.slice(startIndex, startIndex + 2);
      
      if (assignments.length > 0) {
        teacher.assignedSubjects = assignments;
        await teacher.save();
        console.log(`✅ Assigned to ${teacher.name}: ${assignments.map(a => `${a.subject} (${a.class}-${a.section})`).join(', ')}`);
      }
    }

    console.log('✅ Subject assignment completed!');
    console.log('\n📝 Teachers can now create lesson plans for their assigned subjects.');
    console.log('📋 Lesson plan workflow: Teacher → HOD → Principal → Published');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error assigning subjects:', error);
    process.exit(1);
  }
};

assignSubjectsToTeachers(); 