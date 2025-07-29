const mongoose = require('mongoose');
const StudentFeeRecord = require('../models/Finance/studentFeeRecordModel');
const Student = require('../models/Student/studentModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulives', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestFeeRecords = async () => {
  try {
    console.log('🏗️ Creating test StudentFeeRecord entries...');

    // Get some students from the database
    const students = await Student.find().limit(5);
    
    if (students.length === 0) {
      console.log('❌ No students found in database. Please add students first.');
      return;
    }

    console.log(`✅ Found ${students.length} students`);

    // Current academic year
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const testFeeRecords = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Create fee record with pending balance
      const feeRecord = {
        studentId: student._id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        admissionNumber: student.rollNumber, // Using rollNumber as admissionNumber
        class: student.class,
        section: student.section,
        academicYear: academicYear,
        term: 'Term 1',
        parentName: 'Parent of ' + student.name,
        contactNumber: '9876543210',
        totalFee: 50000 + (i * 5000), // Different amounts for each student
        paymentReceived: i % 2 === 0 ? 0 : 15000, // Some students have partial payments
        balanceDue: i % 2 === 0 ? 50000 + (i * 5000) : 35000 + (i * 5000), // Calculate balance
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentStatus: i % 3 === 0 ? 'Overdue' : (i % 2 === 0 ? 'Pending' : 'Partial'),
        status: 'Approved',
        createdBy: new mongoose.Types.ObjectId(), // Dummy ObjectId
        remarks: `Test fee record for ${student.name}`
      };
      
      testFeeRecords.push(feeRecord);
    }

    // Insert test records
    const result = await StudentFeeRecord.insertMany(testFeeRecords);
    console.log(`✅ Created ${result.length} test StudentFeeRecord entries`);

    // Display created records
    result.forEach((record, index) => {
      console.log(`📋 Record ${index + 1}:`, {
        studentName: record.studentName,
        rollNumber: record.rollNumber,
        class: record.class,
        totalFee: record.totalFee,
        balanceDue: record.balanceDue,
        paymentStatus: record.paymentStatus,
        academicYear: record.academicYear
      });
    });

    console.log('🎉 Test data creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating test fee records:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  createTestFeeRecords();
}

module.exports = createTestFeeRecords; 