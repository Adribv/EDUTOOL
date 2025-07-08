const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student/studentModel');
const FeeStructure = require('./models/Finance/feeStructureModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/EDULIVES')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testStudentFees() {
  try {
    // Clear existing test data
    await Student.deleteMany({ rollNumber: 'STU001' });
    await FeeStructure.deleteMany({ class: '12' });
    
    console.log('Cleared existing test data');

    // Create a test student with 12C format (matching your actual data)
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testStudent = new Student({
      name: 'Gokulpriyan Karthikeyan',
      rollNumber: '340',
      password: hashedPassword,
      class: '12C', // This matches your actual student format
      section: 'C',
      email: 'kgokulpriyan@gmail.com',
      status: 'Active'
    });

    await testStudent.save();
    console.log('✅ Created test student:', testStudent.name, 'with class:', testStudent.class);

    // Create fee structure for grade 12 (matching your actual data)
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const academicYear = `${currentYear}-${nextYear}`;
    
    const feeStructure = new FeeStructure({
      academicYear: academicYear,
      class: '12', // This matches what the admin creates
      term: 'Annual',
      components: [
        { name: 'Tuition', amount: 1000000, description: 'vnvjsdjnvsd', isOptional: false }
      ],
      totalAmount: 1000000,
      dueDate: new Date('2025-07-23'),
      latePaymentFee: 0,
      isActive: true
    });

    await feeStructure.save();
    console.log('✅ Created fee structure for grade 12 with total amount: $', feeStructure.totalAmount);

    // Test the grade extraction logic
    const grade = testStudent.class.match(/Class (\d+)/)?.[1] || testStudent.class.match(/^(\d+)/)?.[1] || testStudent.class;
    console.log('✅ Grade extraction test:');
    console.log('   Student class:', testStudent.class);
    console.log('   Extracted grade:', grade);
    console.log('   Fee structure class:', feeStructure.class);
    console.log('   Match:', grade === feeStructure.class ? '✅ YES' : '❌ NO');

    console.log('\n🎯 Test Credentials:');
    console.log('   Roll Number: 340');
    console.log('   Password: password123');
    console.log('   Class: 12C');
    console.log('   Expected Grade: 12');

    console.log('\n📋 Next Steps:');
    console.log('1. Login as student with roll number: 340, password: password123');
    console.log('2. Navigate to /student/fees');
    console.log('3. You should see the fee structure with $1,000,000 total amount');

  } catch (error) {
    console.error('❌ Error in test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testStudentFees(); 