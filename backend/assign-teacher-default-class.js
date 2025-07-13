const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Student = require('./models/Student/studentModel');
const { connectDB } = require('./config/db');

async function assignTeacherDefaultClass() {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    // Get the first available teacher
    const teacher = await Staff.findOne({ role: 'Teacher' });
    if (!teacher) {
      console.log('❌ No teachers found. Please create a teacher first.');
      return;
    }

    console.log(`📚 Found teacher: ${teacher.name} (${teacher.email})`);

    // Create a test student with the same class/section
    const testStudent = await Student.findOne({});
    if (!testStudent) {
      console.log('❌ No students found. Please create a student first.');
      return;
    }

    console.log(`📚 Found student: ${testStudent.name} - Class: "${testStudent.class}" Section: "${testStudent.section}"`);

    // Assign teacher to the student's class
    const defaultClass = {
      class: testStudent.class,
      section: testStudent.section
    };

    // Check if teacher already has this class assigned
    const alreadyAssigned = teacher.assignedClasses && teacher.assignedClasses.some(
      cls => cls.class === defaultClass.class && cls.section === defaultClass.section
    );

    if (alreadyAssigned) {
      console.log(`✅ Teacher already assigned to ${defaultClass.class}-${defaultClass.section}`);
      console.log('Current assigned classes:', teacher.assignedClasses);
    } else {
      // Assign the default class
      if (!teacher.assignedClasses) {
        teacher.assignedClasses = [];
      }

      teacher.assignedClasses.push(defaultClass);
      await teacher.save();

      console.log(`✅ Successfully assigned teacher to ${defaultClass.class}-${defaultClass.section}`);
      console.log('Current assigned classes:', teacher.assignedClasses);
    }

    console.log('\n🎯 Teacher can now:');
    console.log('   1. Add timetable entries for their assigned class');
    console.log('   2. Leave class/section empty to use default assigned class');
    console.log('   3. Students in the same class will see the timetable');

    console.log('\n🎯 Student can now:');
    console.log('   1. View timetable for their class/section');
    console.log('   2. See entries added by their assigned teacher');

    console.log('\n📋 Test Steps:');
    console.log('1. Login as teacher and add timetable entries');
    console.log('2. Login as student and check if timetable appears');
    console.log('3. The linking should work automatically');

  } catch (error) {
    console.error('❌ Error assigning default class:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
assignTeacherDefaultClass(); 