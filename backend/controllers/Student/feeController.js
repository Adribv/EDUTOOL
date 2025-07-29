const Student = require('../../models/Student/studentModel');
const FeeStructure = require('../../models/Finance/feeStructureModel');
const FeePayment = require('../../models/Finance/feePaymentModel');
const StudentFeeRecord = require('../../models/Finance/studentFeeRecordModel');
const mongoose = require('mongoose'); // Added for dummy ObjectId

// Utility function to get current academic year
const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  return currentYear.toString(); // Return just the current year as string
};

// Get fee structure
exports.getFeeStructure = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Extract grade from student class (e.g., "Class 12A" -> "12" or "12C" -> "12")
    const grade = student.class.match(/Class (\d+)/)?.[1] || student.class.match(/^(\d+)/)?.[1] || student.class;
    
    const feeStructure = await FeeStructure.findOne({
      class: grade,
      academicYear: req.query.academicYear || getCurrentAcademicYear()
    });
    
    if (!feeStructure) {
      return res.json({
        class: student.class,
        academicYear: req.query.academicYear || getCurrentAcademicYear(),
        components: [],
        totalAmount: 0
      });
    }
    
    res.json(feeStructure);
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Test endpoint to check StudentFeeRecord data
exports.testStudentFeeRecords = async (req, res) => {
  try {
    console.log('🔍 Testing StudentFeeRecord data...');
    
    // Get total count
    const totalRecords = await StudentFeeRecord.countDocuments();
    console.log(`📊 Total StudentFeeRecord entries: ${totalRecords}`);
    
    // Get all records
    const allRecords = await StudentFeeRecord.find().limit(5);
    console.log('📋 Sample records:', allRecords);
    
    // Get records with pending fees
    const pendingRecords = await StudentFeeRecord.find({
      $or: [
        { balanceDue: { $gt: 0 } },
        { paymentStatus: { $in: ['Pending', 'Overdue', 'Partial'] } }
      ]
    }).limit(5);
    console.log('⚠️ Pending fee records:', pendingRecords);
    
    res.json({
      message: 'StudentFeeRecord test completed',
      totalRecords,
      sampleRecords: allRecords,
      pendingRecords,
      currentAcademicYear: getCurrentAcademicYear()
    });
  } catch (error) {
    console.error('❌ Error testing StudentFeeRecord:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create test fee records
exports.createTestFeeRecords = async (req, res) => {
  try {
    console.log('🏗️ Creating test StudentFeeRecord entries...');

    // Get some students from the database
    const students = await Student.find().limit(3);
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found in database. Please add students first.' });
    }

    console.log(`✅ Found ${students.length} students`);

    // Current academic year
    const currentYear = new Date().getFullYear();
    const academicYear = currentYear.toString(); // Match the format

    const testFeeRecords = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Check if record already exists
      const existingRecord = await StudentFeeRecord.findOne({
        studentId: student._id,
        academicYear: academicYear
      });
      
      if (existingRecord) {
        console.log(`⏭️ Record already exists for ${student.name}`);
        continue;
      }
      
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
        createdBy: req.user?.id || new mongoose.Types.ObjectId(), // Use current user or dummy ObjectId
        remarks: `Test fee record for ${student.name}`
      };
      
      testFeeRecords.push(feeRecord);
    }

    if (testFeeRecords.length === 0) {
      return res.json({ message: 'No new records to create. All students already have fee records.', created: 0 });
    }

    // Insert test records
    const result = await StudentFeeRecord.insertMany(testFeeRecords);
    console.log(`✅ Created ${result.length} test StudentFeeRecord entries`);

    // Display created records
    const createdRecords = result.map((record) => ({
      studentName: record.studentName,
      rollNumber: record.rollNumber,
      class: record.class,
      totalFee: record.totalFee,
      balanceDue: record.balanceDue,
      paymentStatus: record.paymentStatus,
      academicYear: record.academicYear
    }));

    res.json({
      message: 'Test StudentFeeRecord entries created successfully',
      created: result.length,
      records: createdRecords
    });
    
  } catch (error) {
    console.error('❌ Error creating test fee records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    console.log('💰 Getting payment status for user:', req.user.id);
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      console.log('❌ Student not found:', req.user.id);
      return res.status(404).json({ message: 'Student not found' });
    }
    
    console.log('✅ Student found:', student.name, 'ID:', student._id);
    
    const academicYear = req.query.academicYear || getCurrentAcademicYear();
    console.log('📅 Academic year:', academicYear);

    // Try to fetch from StudentFeeRecord first
    console.log('🔍 Searching for StudentFeeRecord with:', {
      studentId: student._id,
      academicYear
    });
    
    const feeRecord = await StudentFeeRecord.findOne({
      studentId: student._id,
      academicYear
    }).sort({ createdAt: -1 });

    console.log('📋 Found fee record:', feeRecord ? 'YES' : 'NO');
    
    if (feeRecord) {
      console.log('💰 Fee record details:', {
        totalFee: feeRecord.totalFee,
        paymentReceived: feeRecord.paymentReceived,
        balanceDue: feeRecord.balanceDue,
        paymentStatus: feeRecord.paymentStatus
      });
      
      // Only return data if there are pending fees
      const hasPendingFees = feeRecord.balanceDue > 0 || 
                            ['Pending', 'Overdue', 'Partial'].includes(feeRecord.paymentStatus);
      
      console.log('⚠️ Has pending fees:', hasPendingFees);
      
      if (hasPendingFees) {
        // Compose payment history from FeePayment if needed
        const payments = await FeePayment.find({
          studentId: student._id,
          academicYear
        });
        
        console.log('💳 Found payments:', payments.length);
        
        const paymentHistory = payments.map(payment => ({
          id: payment._id,
          date: payment.paymentDate.toLocaleDateString(),
          description: payment.components.map(c => c.name).join(', ') || 'Fee Payment',
          amount: payment.amountPaid,
          method: payment.paymentMethod,
          status: payment.status,
          reference: payment.receiptNumber
        }));
        
        const response = {
          currentBalance: feeRecord.paymentReceived,
          dueAmount: feeRecord.balanceDue,
          paymentHistory,
          upcomingPayments: [],
          dueDate: feeRecord.dueDate ? feeRecord.dueDate.toLocaleDateString() : null,
          paymentStatus: feeRecord.paymentStatus,
          totalFee: feeRecord.totalFee,
          studentName: feeRecord.studentName,
          term: feeRecord.term
        };
        
        console.log('✅ Returning fee data:', response);
        return res.json(response);
      } else {
        // No pending fees, return minimal response
        console.log('✅ No pending fees, returning minimal response');
        return res.json({
          currentBalance: feeRecord.paymentReceived,
          dueAmount: 0,
          paymentHistory: [],
          upcomingPayments: [],
          dueDate: null,
          paymentStatus: 'Paid'
        });
      }
    }
    
    console.log('⚠️ No StudentFeeRecord found, falling back to old logic');
    
    // Fallback to old logic if no StudentFeeRecord
    // Extract grade from student class (e.g., "Class 12A" -> "12" or "12C" -> "12")
    const grade = student.class.match(/Class (\d+)/)?.[1] || student.class.match(/^(\d+)/)?.[1] || student.class;
    
    // Get fee structure
    const feeStructure = await FeeStructure.findOne({
      class: grade,
      academicYear
    });
    
    if (!feeStructure) {
      return res.json({
        currentBalance: 0,
        dueAmount: 0,
        paymentHistory: [],
        upcomingPayments: [],
        dueDate: null
      });
    }
    
    // Get payments made by student
    const payments = await FeePayment.find({
      studentId: student._id,
      academicYear
    });
    
    // Calculate total amount paid
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
    
    // Calculate pending amount
    const totalFees = feeStructure.components.reduce((sum, component) => sum + component.amount, 0);
    const pendingAmount = totalFees - totalPaid;
    
    // Format payment history for frontend
    const paymentHistory = payments.map(payment => ({
      id: payment._id,
      date: payment.paymentDate.toLocaleDateString(),
      description: payment.components.map(c => c.name).join(', ') || 'Fee Payment',
      amount: payment.amountPaid,
      method: payment.paymentMethod,
      status: payment.status,
      reference: payment.receiptNumber
    }));
    
    // Create upcoming payments based on fee structure
    const upcomingPayments = feeStructure.components.map(component => ({
      id: component._id || Math.random().toString(),
      dueDate: feeStructure.dueDate.toLocaleDateString(),
      description: component.name,
      amount: component.amount,
      status: 'Pending'
    }));
    
    res.json({
      currentBalance: totalPaid,
      dueAmount: pendingAmount,
      paymentHistory: paymentHistory,
      upcomingPayments: upcomingPayments,
      dueDate: feeStructure.dueDate.toLocaleDateString()
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment receipt
exports.getPaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await FeePayment.findById(paymentId)
      .populate('studentId', 'name rollNumber class section');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Verify this payment belongs to the student
    if (payment.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this receipt' });
    }
    
    // Generate receipt data
    const receipt = {
      receiptNumber: payment.receiptNumber,
      date: payment.date,
      student: {
        name: payment.studentId.name,
        rollNumber: payment.studentId.rollNumber,
        class: payment.studentId.class,
        section: payment.studentId.section
      },
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      components: payment.components,
      academicYear: payment.academicYear,
      term: payment.term
    };
    
    res.json(receipt);
  } catch (error) {
    console.error('Error fetching payment receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Make payment
exports.makePayment = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { amount, method, reference } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ message: 'Amount and payment method are required' });
    }

    const academicYear = getCurrentAcademicYear();
    
    // Extract grade from student class (e.g., "Class 12A" -> "12" or "12C" -> "12")
    const grade = student.class.match(/Class (\d+)/)?.[1] || student.class.match(/^(\d+)/)?.[1] || student.class;
    
    const feeStructure = await FeeStructure.findOne({
      class: grade,
      academicYear
    });

    if (!feeStructure) {
      return res.status(400).json({ message: 'No fee structure found for this class and academic year' });
    }

    // Generate receipt number
    const receiptNumber = `RCPT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Generate transaction ID
    const transactionId = reference || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    const payment = new FeePayment({
      studentId: student._id,
      feeStructureId: feeStructure._id,
      amount: parseFloat(amount),
      amountPaid: parseFloat(amount),
      paymentMethod: method,
      receiptNumber,
      transactionId,
      date: new Date(),
      paymentDate: new Date(),
      academicYear,
      term: feeStructure.term,
      status: 'Completed',
      components: feeStructure.components.map(component => ({
        name: component.name,
        amount: component.amount
      }))
    });

    await payment.save();

    res.status(201).json({
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        receiptNumber: payment.receiptNumber,
        transactionId: payment.transactionId,
        amount: payment.amountPaid,
        date: payment.date
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};