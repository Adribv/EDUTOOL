const Student = require('../../models/Student/studentModel');
const FeeStructure = require('../../models/Finance/feeStructureModel');
const FeePayment = require('../../models/Finance/feePaymentModel');

// Utility function to get current academic year
const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  return `${currentYear}-${nextYear}`;
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

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const academicYear = req.query.academicYear || getCurrentAcademicYear();
    
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