const mongoose = require('mongoose');
const Calendar = require('./models/Academic/calendarModel');
const Event = require('./models/Admin/eventModel');
const Staff = require('./models/Staff/staffModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addSampleEvents = async () => {
  try {
    console.log('🚀 Starting to add sample events...');

    // Get a staff member for createdBy field
    const staffMember = await Staff.findOne();
    if (!staffMember) {
      console.log('❌ No staff member found. Please add staff members first.');
      return;
    }

    // Sample Calendar Events
    const calendarEvents = [
      {
        title: 'Parent-Teacher Meeting',
        description: 'Quarterly parent-teacher meeting to discuss student progress',
        eventType: 'Meeting',
        startDate: new Date('2024-12-20T09:00:00'),
        endDate: new Date('2024-12-20T12:00:00'),
        isHoliday: false,
        targetAudience: ['Parents', 'Teachers'],
        location: 'School Auditorium',
        organizer: 'School Administration',
        createdBy: staffMember._id,
        status: 'Active'
      },
      {
        title: 'Mid-Term Examinations',
        description: 'Mid-term examinations for all classes',
        eventType: 'Exam',
        startDate: new Date('2024-12-15T08:00:00'),
        endDate: new Date('2024-12-19T15:00:00'),
        isHoliday: false,
        targetAudience: ['Students', 'Parents', 'Teachers'],
        location: 'Classrooms',
        organizer: 'Academic Department',
        createdBy: staffMember._id,
        status: 'Active'
      },
      {
        title: 'Winter Break',
        description: 'School closed for winter holidays',
        eventType: 'Holiday',
        startDate: new Date('2024-12-25T00:00:00'),
        endDate: new Date('2025-01-05T23:59:59'),
        isHoliday: true,
        targetAudience: ['All'],
        location: 'School Campus',
        organizer: 'School Administration',
        createdBy: staffMember._id,
        status: 'Active'
      },
      {
        title: 'Science Fair',
        description: 'Annual science fair showcasing student projects',
        eventType: 'Academic',
        startDate: new Date('2024-12-22T10:00:00'),
        endDate: new Date('2024-12-22T16:00:00'),
        isHoliday: false,
        targetAudience: ['Students', 'Parents', 'All'],
        location: 'School Gymnasium',
        organizer: 'Science Department',
        createdBy: staffMember._id,
        status: 'Active'
      },
      {
        title: 'Annual Sports Day',
        description: 'Annual sports competition and athletic events',
        eventType: 'Event',
        startDate: new Date('2024-12-28T08:00:00'),
        endDate: new Date('2024-12-28T17:00:00'),
        isHoliday: false,
        targetAudience: ['Students', 'Parents', 'All'],
        location: 'School Ground',
        organizer: 'Physical Education Department',
        createdBy: staffMember._id,
        status: 'Active'
      }
    ];

    // Sample Event Events
    const eventEvents = [
      {
        title: 'Cultural Festival',
        description: 'Annual cultural festival with music, dance, and drama performances',
        startDate: new Date('2024-12-23T18:00:00'),
        endDate: new Date('2024-12-23T22:00:00'),
        venue: 'School Auditorium',
        organizer: 'Cultural Committee',
        audience: ['Students', 'Parents', 'All'],
        participants: ['Students', 'Teachers', 'Parents'],
        status: 'Scheduled',
        bookingDetails: {
          contactNumber: '+1234567890',
          requirements: 'Formal attire required'
        }
      },
      {
        title: 'Career Counseling Session',
        description: 'Career guidance session for senior students and parents',
        startDate: new Date('2024-12-21T14:00:00'),
        endDate: new Date('2024-12-21T16:00:00'),
        venue: 'Conference Room',
        organizer: 'Career Counseling Department',
        audience: ['Students', 'Parents'],
        participants: ['Career Counselors', 'Industry Experts'],
        status: 'Scheduled',
        bookingDetails: {
          contactNumber: '+1234567891',
          requirements: 'Registration required'
        }
      },
      {
        title: 'Library Week',
        description: 'Week-long celebration of reading and literacy',
        startDate: new Date('2024-12-16T09:00:00'),
        endDate: new Date('2024-12-20T17:00:00'),
        venue: 'School Library',
        organizer: 'Library Department',
        audience: ['Students', 'Parents', 'All'],
        participants: ['Students', 'Teachers', 'Librarians'],
        status: 'Scheduled',
        bookingDetails: {
          contactNumber: '+1234567892',
          requirements: 'Free entry'
        }
      }
    ];

    // Clear existing events
    await Calendar.deleteMany({});
    await Event.deleteMany({});
    console.log('🧹 Cleared existing events');

    // Add calendar events
    const savedCalendarEvents = await Calendar.insertMany(calendarEvents);
    console.log(`✅ Added ${savedCalendarEvents.length} calendar events`);

    // Add event events
    const savedEventEvents = await Event.insertMany(eventEvents);
    console.log(`✅ Added ${savedEventEvents.length} event events`);

    console.log('🎉 Sample events added successfully!');
    console.log('📅 Total events available:', savedCalendarEvents.length + savedEventEvents.length);

    // Display summary
    console.log('\n📊 Event Summary:');
    console.log('Calendar Events:');
    savedCalendarEvents.forEach(event => {
      console.log(`  - ${event.title} (${event.eventType}) - ${event.startDate.toLocaleDateString()}`);
    });
    
    console.log('\nEvent Events:');
    savedEventEvents.forEach(event => {
      console.log(`  - ${event.title} - ${event.startDate.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('❌ Error adding sample events:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addSampleEvents(); 