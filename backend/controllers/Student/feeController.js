const Student = require('../../models/Student/studentModel');
const FeeStructure = require('../../models/Finance/feeStructureModel');
const FeePayment = require('../../models/Finance/feePaymentModel');

// Get fee structure
exports.getFeeStructure = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const feeStructure = await FeeStructure.findOne({
      class: student.class,
      academicYear: req.query.academicYear || new Date().getFullYear().toString()
    });
    
    if (!feeStructure) {
      return res.json({
        class: student.class,
        academicYear: req.query.academicYear || new Date().getFullYear().toString(),
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
    
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    
    // Get fee structure
    const feeStructure = await FeeStructure.findOne({
      class: student.class,
      academicYear
    });
    
    if (!feeStructure) {
      return res.json({
        academicYear,
        totalFees: 0,
        totalPaid: 0,
        pendingAmount: 0,
        paymentHistory: []
      });
    }
    
    // Get payments made by student
    const payments = await FeePayment.find({
      studentId: student._id,
      academicYear
    });
    
    // Calculate total amount paid
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate pending amount
    const totalFees = feeStructure.components.reduce((sum, component) => sum + component.amount, 0);
    const pendingAmount = totalFees - totalPaid;
    
    res.json({
      academicYear,
      totalFees,
      totalPaid,
      pendingAmount,
      paymentHistory: payments
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