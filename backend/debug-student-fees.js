const mongoose = require('mongoose');
const Student = require('./models/Student/studentModel');
const FeeStructure = require('./models/Finance/feeStructureModel');
const FeePayment = require('./models/Finance/feePaymentModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edulives', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  return `${currentYear}-${nextYear}`;
};

async function debugStudentFees() {
  try {
    console.log('🔍 Debugging Student Fees...\n');

    // Get current academic year
    const academicYear = getCurrentAcademicYear();
    console.log(`📅 Current Academic Year: ${academicYear}\n`);

    // Find a test student
    const student = await Student.findOne({});
    if (!student) {
      console.log('❌ No students found in database');
      return;
    }

    console.log(`👤 Student Found:`);
    console.log(`   Name: ${student.name}`);
    console.log(`   Class: ${student.class}`);
    console.log(`   Roll Number: ${student.rollNumber}`);
    console.log(`   ID: ${student._id}\n`);

    // Extract grade from student class
    const grade = student.class.match(/Class (\d+)/)?.[1] || student.class.match(/^(\d+)/)?.[1] || student.class;
    console.log(`📚 Extracted Grade: ${grade}\n`);

    // Check fee structure
    const feeStructure = await FeeStructure.findOne({
      class: grade,
      academicYear
    });

    if (!feeStructure) {
      console.log('❌ No fee structure found for this class and academic year');
      console.log(`   Looking for: class=${grade}, academicYear=${academicYear}`);
      
      // Check what fee structures exist
      const allFeeStructures = await FeeStructure.find({});
      console.log('\n📋 All fee structures in database:');
      allFeeStructures.forEach(fs => {
        console.log(`   - Class: ${fs.class}, Academic Year: ${fs.academicYear}, Components: ${fs.components?.length || 0}`);
      });
      return;
    }

    console.log(`💰 Fee Structure Found:`);
    console.log(`   Class: ${feeStructure.class}`);
    console.log(`   Academic Year: ${feeStructure.academicYear}`);
    console.log(`   Due Date: ${feeStructure.dueDate}`);
    console.log(`   Components: ${feeStructure.components?.length || 0}\n`);

    if (feeStructure.components && feeStructure.components.length > 0) {
      console.log('📝 Fee Components:');
      feeStructure.components.forEach((component, index) => {
        console.log(`   ${index + 1}. ${component.name}: ₹${component.amount}`);
      });
    } else {
      console.log('❌ No fee components found in fee structure');
    }

    // Calculate total fees
    const totalFees = feeStructure.components?.reduce((sum, component) => sum + component.amount, 0) || 0;
    console.log(`\n💵 Total Fees: ₹${totalFees}\n`);

    // Check payments
    const payments = await FeePayment.find({
      studentId: student._id,
      academicYear
    });

    console.log(`💳 Payments Found: ${payments.length}`);
    if (payments.length > 0) {
      payments.forEach((payment, index) => {
        console.log(`   ${index + 1}. Amount: ₹${payment.amountPaid}, Date: ${payment.paymentDate}, Status: ${payment.status}`);
      });
    }

    // Calculate total paid
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
    console.log(`\n💰 Total Paid: ₹${totalPaid}`);

    // Calculate pending amount
    const pendingAmount = totalFees - totalPaid;
    console.log(`💸 Pending Amount: ₹${pendingAmount}`);

    if (pendingAmount === 0) {
      if (totalFees === 0) {
        console.log('\n⚠️  Due amount is zero because no fee structure components found!');
      } else if (totalPaid >= totalFees) {
        console.log('\n✅ Due amount is zero because all fees have been paid!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugStudentFees(); 