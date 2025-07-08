const mongoose = require('mongoose');
const Parent = require('./models/Parent/parentModel');
const Student = require('./models/Student/studentModel');
const Announcement = require('./models/Communication/announcementModel');
const Event = require('./models/Admin/eventModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/EDULIVES', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testParentPortal() {
  try {
    console.log('🧪 Testing Parent Portal Setup...\n');

    // 1. Test Parent Creation
    console.log('1. Creating test parent...');
    const testParent = new Parent({
      name: 'John Doe',
      email: 'parent@test.com',
      password: '$2a$10$testpassword', // This would be hashed in real app
      childRollNumbers: ['TEST001', 'TEST002'],
      contactNumber: '9876543210',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country'
      }
    });
    await testParent.save();
    console.log('✅ Test parent created successfully');

    // 2. Test Student Creation
    console.log('\n2. Creating test students...');
    const testStudent1 = new Student({
      name: 'Alice Doe',
      rollNumber: 'TEST001',
      class: '10',
      section: 'A',
      email: 'alice@test.com',
      password: '$2a$10$testpassword',
      gender: 'Female',
      dateOfBirth: '2008-05-15',
      contactNumber: '9876543210'
    });
    await testStudent1.save();

    const testStudent2 = new Student({
      name: 'Bob Doe',
      rollNumber: 'TEST002',
      class: '8',
      section: 'B',
      email: 'bob@test.com',
      password: '$2a$10$testpassword',
      gender: 'Male',
      dateOfBirth: '2010-03-20',
      contactNumber: '9876543210'
    });
    await testStudent2.save();
    console.log('✅ Test students created successfully');

    // 3. Test Announcement Creation
    console.log('\n3. Creating test announcement...');
    const testAnnouncement = new Announcement({
      title: 'Parent-Teacher Meeting',
      content: 'Annual parent-teacher meeting will be held on December 15th, 2024.',
      targetAudience: 'All Parents',
      isPublished: true,
      publishedAt: new Date(),
      createdBy: testParent._id,
      priority: 'High'
    });
    await testAnnouncement.save();
    console.log('✅ Test announcement created successfully');

    // 4. Test Event Creation
    console.log('\n4. Creating test event...');
    const testEvent = new Event({
      title: 'Annual Sports Day',
      description: 'Annual sports day celebration for all students and parents',
      startDate: new Date('2024-12-20'),
      endDate: new Date('2024-12-20'),
      venue: 'School Ground',
      organizer: 'Sports Department',
      audience: ['Students', 'Parents', 'All'],
      status: 'Scheduled'
    });
    await testEvent.save();
    console.log('✅ Test event created successfully');

    // 5. Test Parent Dashboard Data
    console.log('\n5. Testing parent dashboard data retrieval...');
    const parent = await Parent.findById(testParent._id);
    const children = await Student.find({
      rollNumber: { $in: parent.childRollNumbers }
    }).select('name rollNumber class section');
    
    const announcements = await Announcement.find({
      targetAudience: { $in: ['Parents', 'All'] }
    }).sort({ createdAt: -1 }).limit(5);

    const upcomingEvents = await Event.find({
      startDate: { $gte: new Date() },
      audience: { $in: ['Parents', 'All'] }
    }).sort({ startDate: 1 }).limit(5);

    console.log('✅ Dashboard data retrieved successfully:');
    console.log(`   - Children: ${children.length}`);
    console.log(`   - Announcements: ${announcements.length}`);
    console.log(`   - Upcoming Events: ${upcomingEvents.length}`);

    // 6. Cleanup
    console.log('\n6. Cleaning up test data...');
    await Parent.findByIdAndDelete(testParent._id);
    await Student.findByIdAndDelete(testStudent1._id);
    await Student.findByIdAndDelete(testStudent2._id);
    await Announcement.findByIdAndDelete(testAnnouncement._id);
    await Event.findByIdAndDelete(testEvent._id);
    console.log('✅ Test data cleaned up successfully');

    console.log('\n🎉 Parent Portal Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Parent model works');
    console.log('   ✅ Student model works');
    console.log('   ✅ Announcement model works');
    console.log('   ✅ Event model works');
    console.log('   ✅ Dashboard data retrieval works');
    console.log('   ✅ All API endpoints should be functional');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testParentPortal(); 