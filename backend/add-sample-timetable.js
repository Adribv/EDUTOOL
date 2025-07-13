const mongoose = require('mongoose');
const Timetable = require('./models/Academic/timetableModel');
const Staff = require('./models/Staff/staffModel');
const Student = require('./models/Student/studentModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulives', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addSampleTimetable = async () => {
  try {
    console.log('🚀 Starting to add sample timetable data...');

    // Find a teacher to assign to the timetable
    const teacher = await Staff.findOne({ role: 'Teacher' });
    if (!teacher) {
      console.log('❌ No teacher found. Please create a teacher first.');
      return;
    }

    console.log(`👨‍🏫 Using teacher: ${teacher.name} (${teacher._id})`);

    // Find a student to check their class and section
    const student = await Student.findOne();
    if (!student) {
      console.log('❌ No student found. Please create a student first.');
      return;
    }

    console.log(`👨‍🎓 Student class: ${student.class}-${student.section}`);

    // Check if timetable already exists for this class-section
    const existingTimetable = await Timetable.findOne({
      class: student.class,
      section: student.section
    });

    if (existingTimetable) {
      console.log('⚠️ Timetable already exists for this class-section. Updating...');
      
      // Add some sample periods to existing timetable
      existingTimetable.monday = {
        periods: [
          {
            subject: 'Mathematics',
            teacher: teacher._id,
            startTime: '8:00 AM',
            endTime: '9:30 AM',
            room: 'Room 101'
          },
          {
            subject: 'English',
            teacher: teacher._id,
            startTime: '9:30 AM',
            endTime: '11:00 AM',
            room: 'Room 102'
          },
          {
            subject: 'Science',
            teacher: teacher._id,
            startTime: '11:00 AM',
            endTime: '12:30 PM',
            room: 'Lab 1'
          }
        ]
      };

      existingTimetable.tuesday = {
        periods: [
          {
            subject: 'History',
            teacher: teacher._id,
            startTime: '8:00 AM',
            endTime: '9:30 AM',
            room: 'Room 103'
          },
          {
            subject: 'Geography',
            teacher: teacher._id,
            startTime: '9:30 AM',
            endTime: '11:00 AM',
            room: 'Room 104'
          },
          {
            subject: 'Computer Science',
            teacher: teacher._id,
            startTime: '11:00 AM',
            endTime: '12:30 PM',
            room: 'Computer Lab'
          }
        ]
      };

      existingTimetable.wednesday = {
        periods: [
          {
            subject: 'Mathematics',
            teacher: teacher._id,
            startTime: '8:00 AM',
            endTime: '9:30 AM',
            room: 'Room 101'
          },
          {
            subject: 'Physics',
            teacher: teacher._id,
            startTime: '9:30 AM',
            endTime: '11:00 AM',
            room: 'Physics Lab'
          },
          {
            subject: 'English',
            teacher: teacher._id,
            startTime: '11:00 AM',
            endTime: '12:30 PM',
            room: 'Room 102'
          }
        ]
      };

      existingTimetable.thursday = {
        periods: [
          {
            subject: 'Chemistry',
            teacher: teacher._id,
            startTime: '8:00 AM',
            endTime: '9:30 AM',
            room: 'Chemistry Lab'
          },
          {
            subject: 'Biology',
            teacher: teacher._id,
            startTime: '9:30 AM',
            endTime: '11:00 AM',
            room: 'Biology Lab'
          },
          {
            subject: 'Mathematics',
            teacher: teacher._id,
            startTime: '11:00 AM',
            endTime: '12:30 PM',
            room: 'Room 101'
          }
        ]
      };

      existingTimetable.friday = {
        periods: [
          {
            subject: 'English',
            teacher: teacher._id,
            startTime: '8:00 AM',
            endTime: '9:30 AM',
            room: 'Room 102'
          },
          {
            subject: 'Physical Education',
            teacher: teacher._id,
            startTime: '9:30 AM',
            endTime: '11:00 AM',
            room: 'Sports Ground'
          },
          {
            subject: 'Art',
            teacher: teacher._id,
            startTime: '11:00 AM',
            endTime: '12:30 PM',
            room: 'Art Room'
          }
        ]
      };

      await existingTimetable.save();
      console.log('✅ Updated existing timetable with sample data');

    } else {
      // Create new timetable
      const newTimetable = new Timetable({
        class: student.class,
        section: student.section,
        academicYear: new Date().getFullYear().toString(),
        term: 'Current',
        isActive: true,
        createdBy: teacher._id,
        monday: {
          periods: [
            {
              subject: 'Mathematics',
              teacher: teacher._id,
              startTime: '8:00 AM',
              endTime: '9:30 AM',
              room: 'Room 101'
            },
            {
              subject: 'English',
              teacher: teacher._id,
              startTime: '9:30 AM',
              endTime: '11:00 AM',
              room: 'Room 102'
            },
            {
              subject: 'Science',
              teacher: teacher._id,
              startTime: '11:00 AM',
              endTime: '12:30 PM',
              room: 'Lab 1'
            }
          ]
        },
        tuesday: {
          periods: [
            {
              subject: 'History',
              teacher: teacher._id,
              startTime: '8:00 AM',
              endTime: '9:30 AM',
              room: 'Room 103'
            },
            {
              subject: 'Geography',
              teacher: teacher._id,
              startTime: '9:30 AM',
              endTime: '11:00 AM',
              room: 'Room 104'
            },
            {
              subject: 'Computer Science',
              teacher: teacher._id,
              startTime: '11:00 AM',
              endTime: '12:30 PM',
              room: 'Computer Lab'
            }
          ]
        },
        wednesday: {
          periods: [
            {
              subject: 'Mathematics',
              teacher: teacher._id,
              startTime: '8:00 AM',
              endTime: '9:30 AM',
              room: 'Room 101'
            },
            {
              subject: 'Physics',
              teacher: teacher._id,
              startTime: '9:30 AM',
              endTime: '11:00 AM',
              room: 'Physics Lab'
            },
            {
              subject: 'English',
              teacher: teacher._id,
              startTime: '11:00 AM',
              endTime: '12:30 PM',
              room: 'Room 102'
            }
          ]
        },
        thursday: {
          periods: [
            {
              subject: 'Chemistry',
              teacher: teacher._id,
              startTime: '8:00 AM',
              endTime: '9:30 AM',
              room: 'Chemistry Lab'
            },
            {
              subject: 'Biology',
              teacher: teacher._id,
              startTime: '9:30 AM',
              endTime: '11:00 AM',
              room: 'Biology Lab'
            },
            {
              subject: 'Mathematics',
              teacher: teacher._id,
              startTime: '11:00 AM',
              endTime: '12:30 PM',
              room: 'Room 101'
            }
          ]
        },
        friday: {
          periods: [
            {
              subject: 'English',
              teacher: teacher._id,
              startTime: '8:00 AM',
              endTime: '9:30 AM',
              room: 'Room 102'
            },
            {
              subject: 'Physical Education',
              teacher: teacher._id,
              startTime: '9:30 AM',
              endTime: '11:00 AM',
              room: 'Sports Ground'
            },
            {
              subject: 'Art',
              teacher: teacher._id,
              startTime: '11:00 AM',
              endTime: '12:30 PM',
              room: 'Art Room'
            }
          ]
        }
      });

      await newTimetable.save();
      console.log('✅ Created new timetable with sample data');
    }

    // Also assign the teacher to these subjects for this class-section
    const teacherSubjects = [
      { class: student.class, section: student.section, subject: 'Mathematics' },
      { class: student.class, section: student.section, subject: 'English' },
      { class: student.class, section: student.section, subject: 'Science' },
      { class: student.class, section: student.section, subject: 'History' },
      { class: student.class, section: student.section, subject: 'Geography' },
      { class: student.class, section: student.section, subject: 'Computer Science' },
      { class: student.class, section: student.section, subject: 'Physics' },
      { class: student.class, section: student.section, subject: 'Chemistry' },
      { class: student.class, section: student.section, subject: 'Biology' },
      { class: student.class, section: student.section, subject: 'Physical Education' },
      { class: student.class, section: student.section, subject: 'Art' }
    ];

    // Add assigned subjects to teacher if not already present
    if (!teacher.assignedSubjects) {
      teacher.assignedSubjects = [];
    }

    teacherSubjects.forEach(subject => {
      const exists = teacher.assignedSubjects.some(
        s => s.class === subject.class && s.section === subject.section && s.subject === subject.subject
      );
      if (!exists) {
        teacher.assignedSubjects.push(subject);
      }
    });

    await teacher.save();
    console.log('✅ Updated teacher with assigned subjects');

    console.log('🎉 Sample timetable data added successfully!');
    console.log(`📅 Timetable created for class ${student.class}-${student.section}`);
    console.log(`👨‍🏫 Teacher ${teacher.name} assigned to multiple subjects`);
    console.log(`👨‍🎓 Student ${student.name} can now view their timetable`);

  } catch (error) {
    console.error('❌ Error adding sample timetable:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
addSampleTimetable(); 