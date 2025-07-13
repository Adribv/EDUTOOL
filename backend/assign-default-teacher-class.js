const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const { connectDB } = require('./config/db');

async function assignDefaultTeacherClass() {
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

    // Assign teacher to a default class
    const defaultClass = {
      class: '10',
      section: 'A'
    };

    // Check if teacher already has this class assigned
    const alreadyAssigned = teacher.assignedClasses && teacher.assignedClasses.some(
      cls => cls.class === defaultClass.class && cls.section === defaultClass.section
    );

    if (alreadyAssigned) {
      console.log(`✅ Teacher already assigned to ${defaultClass.class}-${defaultClass.section}`);
      console.log('Current assigned classes:', teacher.assignedClasses);
      return;
    }

    // Assign the default class
    if (!teacher.assignedClasses) {
      teacher.assignedClasses = [];
    }

    teacher.assignedClasses.push(defaultClass);
    await teacher.save();

    console.log(`✅ Successfully assigned teacher to ${defaultClass.class}-${defaultClass.section}`);
    console.log('Current assigned classes:', teacher.assignedClasses);

    console.log('\n🎯 Teacher can now:');
    console.log('   1. Add timetable entries for Class 10-A');
    console.log('   2. Enter any subject manually');
    console.log('   3. View their timetable');

  } catch (error) {
    console.error('❌ Error assigning default class:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
assignDefaultTeacherClass(); 