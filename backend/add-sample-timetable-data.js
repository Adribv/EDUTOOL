const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Timetable = require('./models/Academic/timetableModel');
const { connectDB } = require('./config/db');

async function addSampleTimetableData() {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    // Get some existing teachers
    const teachers = await Staff.find({ role: 'Teacher' }).limit(5);
    if (teachers.length === 0) {
      console.log('❌ No teachers found. Please run add-sample-teacher-data.js first.');
      return;
    }

    console.log(`📚 Found ${teachers.length} teachers`);

    // Assign teachers to classes and sections
    const classAssignments = [
      { class: '10', section: 'A', teacherId: teachers[0]._id },
      { class: '10', section: 'B', teacherId: teachers[1]._id },
      { class: '9', section: 'A', teacherId: teachers[2]._id },
      { class: '9', section: 'B', teacherId: teachers[3]._id },
      { class: '8', section: 'A', teacherId: teachers[4]._id },
    ];

    // Update teachers with class assignments
    for (const assignment of classAssignments) {
      await Staff.findByIdAndUpdate(
        assignment.teacherId,
        {
          $push: {
            assignedClasses: {
              class: assignment.class,
              section: assignment.section
            }
          }
        }
      );
      console.log(`✅ Assigned teacher to ${assignment.class}-${assignment.section}`);
    }

    // Create sample timetable entries
    const timeSlots = [
      '8:00 AM - 9:30 AM',
      '9:30 AM - 11:00 AM',
      '11:00 AM - 12:30 PM',
      '12:30 PM - 2:00 PM',
      '2:00 PM - 3:30 PM',
      '3:30 PM - 5:00 PM'
    ];

    const subjects = [
      'Mathematics',
      'English',
      'Science',
      'Social Studies',
      'Hindi',
      'Computer Science',
      'Physical Education',
      'Art'
    ];

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    // Create timetables for each class-section
    for (const assignment of classAssignments) {
      let timetable = await Timetable.findOne({
        class: assignment.class,
        section: assignment.section,
        isActive: true
      });

      if (!timetable) {
        timetable = new Timetable({
          class: assignment.class,
          section: assignment.section,
          academicYear: new Date().getFullYear().toString(),
          term: 'Current',
          isActive: true,
          createdBy: assignment.teacherId
        });
      }

      // Add periods for each day
      days.forEach((day, dayIndex) => {
        if (!timetable[day]) {
          timetable[day] = { periods: [] };
        }

        // Add 4-5 periods per day
        for (let i = 0; i < 5; i++) {
          const subject = subjects[Math.floor(Math.random() * subjects.length)];
          const timeSlot = timeSlots[i];
          const [startTime, endTime] = timeSlot.split(' - ');

          timetable[day].periods.push({
            subject: subject,
            teacher: assignment.teacherId,
            startTime: startTime,
            endTime: endTime,
            room: `Room ${Math.floor(Math.random() * 20) + 101}`
          });
        }
      });

      await timetable.save();
      console.log(`✅ Created timetable for ${assignment.class}-${assignment.section}`);
    }

    console.log('🎉 Sample timetable data added successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Assigned ${classAssignments.length} teachers to classes`);
    console.log(`- Created timetables for ${classAssignments.length} class-sections`);
    console.log(`- Added ${days.length * 5} periods per class-section`);

  } catch (error) {
    console.error('❌ Error adding sample timetable data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
addSampleTimetableData(); 