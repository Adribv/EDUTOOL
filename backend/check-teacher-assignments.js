const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');

async function checkTeacherAssignments() {
  try {
    // Use the same MongoDB URI as in the config
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to database');

    // Get all teachers
    const teachers = await Staff.find({ role: 'Teacher' }).select('name email assignedSubjects');
    
    console.log(`\n📊 Found ${teachers.length} teachers in the database`);
    
    if (teachers.length === 0) {
      console.log('❌ No teachers found in the database');
      return;
    }

    // Check teachers with assignments
    const teachersWithAssignments = teachers.filter(teacher => 
      teacher.assignedSubjects && teacher.assignedSubjects.length > 0
    );

    console.log(`\n👨‍🏫 Teachers with assignments: ${teachersWithAssignments.length}/${teachers.length}`);

    if (teachersWithAssignments.length === 0) {
      console.log('❌ No teachers have assigned subjects');
      console.log('\n💡 To assign subjects to teachers, you can:');
      console.log('   1. Use the HOD interface to assign subjects');
      console.log('   2. Run the assign-teacher-subjects.js script');
      console.log('   3. Manually update teacher records in the database');
      return;
    }

    // Show assignments for each teacher
    console.log('\n📚 Teacher Assignments:');
    teachersWithAssignments.forEach((teacher, index) => {
      console.log(`\n${index + 1}. ${teacher.name} (${teacher.email})`);
      teacher.assignedSubjects.forEach(assignment => {
        console.log(`   - ${assignment.subject} (Class ${assignment.class}-${assignment.section})`);
      });
    });

    // Extract unique classes, sections, and subjects
    const allAssignments = teachersWithAssignments.flatMap(teacher => teacher.assignedSubjects);
    const uniqueClasses = [...new Set(allAssignments.map(a => a.class))].sort();
    const uniqueSections = [...new Set(allAssignments.map(a => a.section))].sort();
    const uniqueSubjects = [...new Set(allAssignments.map(a => a.subject))].sort();

    console.log('\n📋 Available Options for Lesson Plans:');
    console.log(`Classes: ${uniqueClasses.join(', ')}`);
    console.log(`Sections: ${uniqueSections.join(', ')}`);
    console.log(`Subjects: ${uniqueSubjects.join(', ')}`);

    // Show subject groups by class-section
    const subjectGroups = {};
    allAssignments.forEach(assignment => {
      const key = `${assignment.class}-${assignment.section}`;
      if (!subjectGroups[key]) {
        subjectGroups[key] = {
          class: assignment.class,
          section: assignment.section,
          subjects: []
        };
      }
      if (!subjectGroups[key].subjects.includes(assignment.subject)) {
        subjectGroups[key].subjects.push(assignment.subject);
      }
    });

    console.log('\n📖 Subject Groups by Class-Section:');
    Object.values(subjectGroups).forEach(group => {
      console.log(`Class ${group.class}-${group.section}: ${group.subjects.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

checkTeacherAssignments(); 