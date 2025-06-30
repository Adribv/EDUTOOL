const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Student = require('./models/Student/studentModel');
const StudentLeaveRequest = require('./models/Staff/leaveRequestModel');

async function debugLeaveRequests() {
  try {
    console.log('🔍 DEBUGGING LEAVE REQUESTS CREATION');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/edutool', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const staffId = '685ac0b4d60acdac26b2f9f1';
    console.log('\n1. Checking staff with ID:', staffId);
    
    // Get staff with coordinator classes
    const staff = await Staff.findById(staffId)
      .populate('coordinator', '_id name grade section')
      .select('-password');
    
    if (!staff) {
      console.log('❌ Staff not found');
      return;
    }

    console.log('✅ Staff found:', staff.name);
    console.log('Staff coordinator:', staff.coordinator);

    const coordinatedClasses = staff.coordinator || [];
    console.log('\n2. Coordinated classes:', coordinatedClasses);
    
    if (coordinatedClasses.length === 0) {
      console.log('❌ No coordinated classes found');
      return;
    }
    
    // Get students in coordinated classes
    const students = await Student.find({
      $or: [
        { class: { $in: coordinatedClasses.map(cls => cls.name) } },
        {
          $and: [
            { class: { $in: coordinatedClasses.map(cls => cls.grade) } },
            { section: { $in: coordinatedClasses.map(cls => cls.section) } }
          ]
        }
      ],
      status: 'Active'
    });
    
    console.log(`\n3. Found ${students.length} students in coordinated classes:`);
    students.forEach(student => {
      console.log(`- ${student.name} (${student.studentId}) - Class: ${student.class}${student.section}`);
    });
    
    if (students.length === 0) {
      console.log('❌ No students found in coordinated classes');
      return;
    }
    
    // Check existing leave requests
    console.log('\n4. Checking existing leave requests...');
    const studentIds = students.map(student => student._id);
    const existingRequests = await StudentLeaveRequest.find({
      studentId: { $in: studentIds }
    });
    
    console.log(`Found ${existingRequests.length} existing leave requests`);
    
    // Try to create one sample leave request
    console.log('\n5. Testing leave request creation...');
    
    const sampleRequest = {
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      reason: 'Test medical appointment',
      type: 'Medical',
      status: 'Pending'
    };
    
    try {
      const newLeaveRequest = new StudentLeaveRequest({
        studentId: students[0]._id,
        class: students[0].class,
        section: students[0].section,
        startDate: sampleRequest.startDate,
        endDate: sampleRequest.endDate,
        reason: sampleRequest.reason,
        type: sampleRequest.type,
        status: sampleRequest.status
      });

      console.log('Attempting to save leave request...');
      console.log('Leave request data:', {
        studentId: newLeaveRequest.studentId,
        class: newLeaveRequest.class,
        section: newLeaveRequest.section,
        startDate: newLeaveRequest.startDate,
        endDate: newLeaveRequest.endDate,
        reason: newLeaveRequest.reason,
        type: newLeaveRequest.type,
        status: newLeaveRequest.status
      });

      await newLeaveRequest.save();
      console.log('✅ Successfully created test leave request!');
      
      // Verify it was saved
      const savedRequest = await StudentLeaveRequest.findById(newLeaveRequest._id);
      console.log('Saved request:', savedRequest);
      
    } catch (error) {
      console.error('❌ Error creating leave request:', error.message);
      console.error('Full error:', error);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
}

debugLeaveRequests(); 