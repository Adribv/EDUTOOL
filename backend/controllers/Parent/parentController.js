const Parent = require('../../models/Parent/parentModel');
const Student = require('../../models/Student/studentModel');
const Timetable = require('../../models/Academic/timetableModel');
const Assignment = require('../../models/Staff/Teacher/assignment.model');
const Submission = require('../../models/Staff/Teacher/submission.model');
const Attendance = require('../../models/Staff/Teacher/attendance.model');
const LeaveRequest = require('../../models/Student/leaveRequestModel');
const Exam = require('../../models/Staff/Teacher/exam.model');
const ExamResult = require('../../models/Staff/Teacher/examResult.model');
const ReportCard = require('../../models/Student/reportCardModel');
const FeeStructure = require('../../models/Finance/feeStructureModel');
const FeePayment = require('../../models/Finance/feePaymentModel');
const HealthRecord = require('../../models/Student/healthRecordModel');
const Announcement = require('../../models/Communication/announcementModel');
const Event = require('../../models/Admin/eventModel');
const SchoolDocument = require('../../models/Admin/schoolDocumentModel');
const Message = require('../../models/Communication/messageModel');
const Complaint = require('../../models/Communication/communicationModel');
const Meeting = require('../../models/Staff/Teacher/meeting.model');
const Transport = require('../../models/Admin/transportModel');
const Calendar = require('../../models/Academic/calendarModel');
const Subject = require('../../models/Admin/subjectModel');

// 1. Child Profile Access

// Get all children profiles
exports.getChildrenProfiles = async (req, res) => {
  try {
    console.log('👨‍👩‍👧‍👦 Getting children for parent ID:', req.user.id);
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      console.log('❌ Parent not found:', req.user.id);
      return res.status(404).json({ message: 'Parent not found' });
    }

    console.log('✅ Parent found:', { 
      name: parent.name, 
      email: parent.email, 
      childRollNumbers: parent.childRollNumbers 
    });

    // Get all children based on roll numbers
    const children = await Student.find({
      rollNumber: { $in: parent.childRollNumbers }
    }).select('-password');

    console.log('📊 Found children:', children.length, 'children');
    console.log('👶 Children data:', children.map(c => ({ 
      name: c.name, 
      rollNumber: c.rollNumber, 
      class: c.class, 
      section: c.section 
    })));

    res.json(children);
  } catch (error) {
    console.error('❌ Error fetching children profiles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get specific child profile
exports.getChildProfile = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    console.log('🔍 Getting child profile for rollNumber:', rollNumber);
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      console.log('❌ Parent not found:', req.user.id);
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      console.log('❌ Child not authorized for parent. Child roll:', rollNumber, 'Parent children:', parent.childRollNumbers);
      return res.status(403).json({ message: 'Not authorized to view this child\'s profile' });
    }
    
    const child = await Student.findOne({ rollNumber }).select('-password');
    
    if (!child) {
      console.log('❌ Child not found:', rollNumber);
      return res.status(404).json({ message: 'Child not found' });
    }
    
    console.log('✅ Child found:', { 
      _id: child._id, 
      name: child.name, 
      class: child.class, 
      section: child.section,
      rollNumber: child.rollNumber 
    });
    
    // Log the full child object to see all available fields
    console.log('📋 Full child object:', JSON.stringify(child.toObject(), null, 2));
    
    console.log('✅ Authorization successful, returning child data');
    res.json(child);
  } catch (error) {
    console.error('❌ Error fetching child profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request profile update
exports.requestProfileUpdate = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { name, contactNumber, address, email } = req.body;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to update this child\'s profile' });
    }
    
    // Create update request (in a real app, this would be saved to a database)
    const updateRequest = {
      parentId: req.user.id,
      studentRollNumber: rollNumber,
      requestedUpdates: {
        name, contactNumber, address, email
      },
      status: 'Pending',
      requestDate: new Date()
    };
    
    res.json({ 
      message: 'Profile update request submitted successfully',
      updateRequest
    });
  } catch (error) {
    console.error('Error requesting profile update:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Academic Monitoring

// Get child's timetable
exports.getChildTimetable = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s timetable' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const timetable = await Timetable.findOne({
      class: child.class,
      section: child.section
    });
    
    if (!timetable) {
      // Return an empty timetable structure instead of 404 to avoid UI errors
      return res.json({ periods: [] });
    }
    
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching child timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's subjects and teachers
exports.getChildSubjects = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s subjects' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Fetch subjects for the child's grade/class and populate teacher names
    const subjects = await Subject.find({ grade: child.class }).populate('teacher', 'name');

    res.json({
      class: child.class,
      section: child.section,
      subjects: subjects.map((subj) => ({
        name: subj.name,
        teacher: subj.teacher ? subj.teacher.name : null,
      }))
    });
  } catch (error) {
    console.error('Error fetching child subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's homework and assignments
exports.getChildAssignments = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    console.log('🔍 Getting assignments for rollNumber:', rollNumber);
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      console.log('❌ Parent not found:', req.user.id);
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      console.log('❌ Child not authorized for parent. Child roll:', rollNumber, 'Parent children:', parent.childRollNumbers);
      return res.status(403).json({ message: 'Not authorized to view this child\'s assignments' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      console.log('❌ Child not found:', rollNumber);
      return res.status(404).json({ message: 'Child not found' });
    }
    
    console.log('✅ Child found:', { name: child.name, class: child.class, section: child.section });
    
    // Log the query parameters
    console.log('🔍 Querying assignments with:', {
      class: child.class,
      section: child.section,
      status: ['Active', 'Completed']
    });
    
    const assignments = await Assignment.find({
      class: child.class,
      section: child.section,
      status: { $in: ['Active', 'Completed'] }
    }).sort({ dueDate: 1 });
    
    console.log('📚 Found assignments:', assignments.length);
    if (assignments.length === 0) {
      // Check if there are any assignments without status filter
      const allAssignments = await Assignment.find({
        class: child.class,
        section: child.section
      });
      console.log('🔍 Total assignments for this class/section (any status):', allAssignments.length);
      allAssignments.forEach(assignment => {
        console.log(`  - ${assignment.title} (Status: ${assignment.status})`);
      });
    }
    
    // Get submission status for each assignment
    const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: child._id
      });
      
      const result = {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : 'Not Submitted',
        submissionId: submission ? submission._id : null
      };
      
      console.log('📝 Assignment:', assignment.title, 'Status:', result.submissionStatus);
      return result;
    }));
    
    console.log('✅ Returning assignments with status:', assignmentsWithStatus.length);
    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error('❌ Error fetching child assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's performance analytics
exports.getChildPerformance = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s performance' });
    }
    
    const child = await Student.findOne({ rollNumber });
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    console.log('✅ Child found for performance:', { 
      _id: child._id, 
      name: child.name, 
      rollNumber: child.rollNumber 
    });
    
    const examResults = await ExamResult.find({
      studentId: child._id
    }).populate('examId', 'title date type subject');
    
    console.log('📊 Found exam results:', examResults.length);
    examResults.forEach(result => {
      console.log(`  - ${result.examId.title} (${result.examId.subject}): ${result.score}%`);
    });
    
    // Group results by subject
    const subjectPerformance = {};
    
    examResults.forEach(result => {
      const subject = result.examId.subject;
      
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = {
          scores: [],
          average: 0,
          highest: 0,
          lowest: 100
        };
      }
      
      subjectPerformance[subject].scores.push(result.score);
      
      // Update highest and lowest scores
      if (result.score > subjectPerformance[subject].highest) {
        subjectPerformance[subject].highest = result.score;
      }
      
      if (result.score < subjectPerformance[subject].lowest) {
        subjectPerformance[subject].lowest = result.score;
      }
    });
    
    // Calculate averages
    Object.keys(subjectPerformance).forEach(subject => {
      const scores = subjectPerformance[subject].scores;
      const sum = scores.reduce((total, score) => total + score, 0);
      subjectPerformance[subject].average = sum / scores.length;
    });
    
    res.json({
      subjectPerformance,
      overallPerformance: {
        examsTaken: examResults.length,
        averageScore: examResults.length > 0 ? 
          examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching child performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Attendance Oversight

// Get child's attendance records
exports.getChildAttendance = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { month, year } = req.query;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s attendance' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Build query based on provided filters
    const query = {
      'attendanceData.studentRollNumber': child.rollNumber
    };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendanceRecords = await Attendance.find(query).sort({ date: -1 });
    
    // Extract the specific student's attendance data from each record
    const studentAttendanceRecords = attendanceRecords.map(record => {
      const studentData = record.attendanceData.find(data => data.studentRollNumber === child.rollNumber);
      return {
        _id: record._id,
        date: record.date,
        status: studentData ? studentData.status : 'Not Marked',
        remarks: studentData ? studentData.remarks : '',
        class: record.class,
        section: record.section
      };
    }).filter(record => record.status !== 'Not Marked');
    
    // Calculate attendance statistics
    const totalDays = studentAttendanceRecords.length;
    const presentDays = studentAttendanceRecords.filter(record => record.status === 'Present').length;
    const absentDays = studentAttendanceRecords.filter(record => record.status === 'Absent').length;
    const leaveDays = studentAttendanceRecords.filter(record => record.status === 'Leave').length;
    
    res.json({
      records: studentAttendanceRecords,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        leaveDays,
        attendancePercentage: totalDays > 0 ? (presentDays / totalDays) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching child attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit leave application for child
exports.submitLeaveApplication = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { startDate, endDate, reason, type } = req.body;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to submit leave for this child' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const leaveRequest = new LeaveRequest({
      studentId: child._id,
      class: child.class,
      section: child.section,
      startDate,
      endDate,
      reason,
      type,
      status: 'Pending',
      requestedBy: 'Parent',
      parentId: parent._id
    });
    
    await leaveRequest.save();
    res.status(201).json({ message: 'Leave application submitted successfully', leaveRequest });
  } catch (error) {
    console.error('Error submitting leave application:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's leave applications
exports.getChildLeaveApplications = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s leave applications' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const leaveRequests = await LeaveRequest.find({ studentId: child._id })
      .sort({ createdAt: -1 });
    
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching child leave applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. Examination and Results

// Get child's upcoming exams
exports.getChildUpcomingExams = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s exams' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const currentDate = new Date();
    
    const exams = await Exam.find({
      class: child.class,
      section: child.section,
      date: { $gte: currentDate }
    }).sort({ date: 1 });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching child upcoming exams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's exam results
exports.getChildExamResults = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s exam results' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const examResults = await ExamResult.find({
      studentId: child._id
    }).populate('examId', 'title date type');
    
    res.json(examResults);
  } catch (error) {
    console.error('Error fetching child exam results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's report cards
exports.getChildReportCards = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s report cards' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const reportCards = await ReportCard.find({
      studentId: child._id
    }).sort({ academicYear: -1, term: -1 });
    
    res.json(reportCards);
  } catch (error) {
    console.error('Error fetching child report cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. Fee Management

// Get child's fee structure
exports.getChildFeeStructure = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { academicYear } = req.query;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s fee structure' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const feeStructure = await FeeStructure.findOne({
      class: child.class,
      academicYear: academicYear || new Date().getFullYear().toString()
    });
    
    if (!feeStructure) {
      return res.json({
        class: child.class,
        academicYear: academicYear || new Date().getFullYear().toString(),
        components: []
      });
    }
    
    res.json(feeStructure);
  } catch (error) {
    console.error('Error fetching child fee structure:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's payment status
exports.getChildPaymentStatus = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { academicYear } = req.query;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s payment status' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const currentAcademicYear = academicYear || new Date().getFullYear().toString();
    
    // Get fee structure
    const feeStructure = await FeeStructure.findOne({
      class: child.class,
      academicYear: currentAcademicYear
    });
    
    if (!feeStructure) {
      return res.json({
        academicYear: currentAcademicYear,
        totalFees: 0,
        totalPaid: 0,
        pendingAmount: 0,
        paymentHistory: []
      });
    }
    
    // Get payments made by student
    const payments = await FeePayment.find({
      studentId: child._id,
      academicYear: currentAcademicYear
    });
    
    // Calculate total amount paid
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate pending amount
    const totalFees = feeStructure.components.reduce((sum, component) => sum + component.amount, 0);
    const pendingAmount = totalFees - totalPaid;
    
    res.json({
      academicYear: currentAcademicYear,
      totalFees,
      totalPaid,
      pendingAmount,
      paymentHistory: payments
    });
  } catch (error) {
    console.error('Error fetching child payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's payment receipt
exports.getChildPaymentReceipt = async (req, res) => {
  try {
    const { rollNumber, paymentId } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s payment receipts' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const payment = await FeePayment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Verify this payment belongs to the child
    if (payment.studentId.toString() !== child._id.toString()) {
      return res.status(403).json({ message: 'This payment does not belong to your child' });
    }
    
    // Generate receipt data
    const receipt = {
      receiptNumber: payment.receiptNumber,
      date: payment.date,
      student: {
        name: child.name,
        rollNumber: child.rollNumber,
        class: child.class,
        section: child.section
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
    console.error('Error fetching child payment receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 6. Communication Tools

// Send message to teacher or admin
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, recipientModel, subject, content, attachments } = req.body;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    const message = new Message({
      senderId: req.user.id,
      senderModel: 'Parent',
      recipientId,
      recipientModel,
      subject,
      content,
      attachments: attachments || []
    });
    
    await message.save();
    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get received messages
exports.getReceivedMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      recipientId: req.user.id,
      recipientModel: 'Parent',
      isArchived: false
    }).sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching received messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sent messages
exports.getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      senderId: req.user.id,
      senderModel: 'Parent',
      isArchived: false
    }).sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit formal complaint or inquiry
exports.submitComplaint = async (req, res) => {
  try {
    const { subject, content, category, priority, attachments } = req.body;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Find admin recipient (in a real app, you would have a more sophisticated way to route complaints)
    // For now, we'll just create a message with a special subject prefix
    
    const message = new Message({
      senderId: req.user.id,
      senderModel: 'Parent',
      recipientId: null, // This would be set to an appropriate admin ID in a real app
      recipientModel: 'Staff',
      subject: `[${category.toUpperCase()}] ${subject}`,
      content,
      attachments: attachments || [],
      metadata: {
        isComplaint: true,
        category,
        priority
      }
    });
    
    await message.save();
    res.status(201).json({ message: 'Complaint submitted successfully', data: message });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Schedule parent-teacher meeting
exports.scheduleMeeting = async (req, res) => {
  try {
    const { teacherId, preferredDate, preferredTime, reason, childRollNumber } = req.body;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(childRollNumber)) {
      return res.status(403).json({ message: 'Not authorized to schedule meeting for this child' });
    }
    
    const child = await Student.findOne({ rollNumber: childRollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Create meeting request message
    const message = new Message({
      senderId: req.user.id,
      senderModel: 'Parent',
      recipientId: teacherId,
      recipientModel: 'Staff',
      subject: `Meeting Request: ${child.name} (${childRollNumber})`,
      content: `I would like to schedule a meeting regarding ${child.name}. \n\nPreferred Date: ${preferredDate} \nPreferred Time: ${preferredTime} \n\nReason: ${reason}`,
      metadata: {
        isMeetingRequest: true,
        preferredDate,
        preferredTime,
        studentId: child._id
      }
    });
    
    await message.save();
    res.status(201).json({ message: 'Meeting request sent successfully', data: message });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Get announcements for all parents or specific parents
    const announcements = await Announcement.find({
      $or: [
        { targetAudience: 'All Parents' },
        { targetAudience: 'All' }
      ],
      isPublished: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    }).sort({ publishedAt: -1 });
    
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 7. Transport Tracking

// Get child's transport information
exports.getChildTransportInfo = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s transport information' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Find transport vehicle assigned to the child
    const transport = await Transport.findOne({
      'students.rollNumber': rollNumber
    });
    
    if (!transport) {
      return res.status(404).json({ message: 'No transport assigned to this child' });
    }
    
    // Get student-specific transport info
    const studentTransport = transport.students.find(s => s.rollNumber === rollNumber);
    
    const transportInfo = {
      vehicleNumber: transport.vehicleNumber,
      vehicleType: transport.vehicleType,
      routeNumber: transport.routeNumber,
      routeDescription: transport.routeDescription,
      driverName: transport.driverName,
      driverContact: transport.driverContact,
      stops: transport.stops,
      pickupStop: studentTransport.pickupStop,
      dropStop: studentTransport.dropStop,
      // In a real app, you would have real-time location data
      currentLocation: {
        latitude: null,
        longitude: null,
        lastUpdated: null,
        status: 'Feature not available'
      }
    };
    
    res.json(transportInfo);
  } catch (error) {
    console.error('Error fetching child transport info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Contact transport coordinator
exports.contactTransportCoordinator = async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // In a real app, you would have a way to identify the transport coordinator
    // For now, we'll just create a message with a special subject prefix
    
    const transportMessage = new Message({
      senderId: req.user.id,
      senderModel: 'Parent',
      recipientId: null, // This would be set to the transport coordinator's ID in a real app
      recipientModel: 'Staff',
      subject: `[TRANSPORT] ${subject}`,
      content: message
    });
    
    await transportMessage.save();
    res.status(201).json({ message: 'Message sent to transport coordinator', data: transportMessage });
  } catch (error) {
    console.error('Error contacting transport coordinator:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 8. Calendar Access

// Get school calendar
exports.getSchoolCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Query for Calendar events
    let calendarQuery = {
      $or: [
        { targetAudience: 'Parents' },
        { targetAudience: 'All' }
      ],
      status: 'Active'
    };
    
    // Query for Event events
    let eventQuery = {
      $or: [
        { audience: 'Parents' },
        { audience: 'All' }
      ],
      status: { $ne: 'Cancelled' }
    };
    
    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      calendarQuery.startDate = { $lte: endDate };
      calendarQuery.endDate = { $gte: startDate };
      
      eventQuery.startDate = { $lte: endDate };
      eventQuery.endDate = { $gte: startDate };
    }
    
    // Fetch from both models
    const [calendarEvents, eventEvents] = await Promise.all([
      Calendar.find(calendarQuery).sort({ startDate: 1 }),
      Event.find(eventQuery).sort({ startDate: 1 })
    ]);
    
    // Format calendar events to match frontend expectations
    const formattedCalendarEvents = calendarEvents.map(event => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.location || 'School Campus',
      organizer: event.organizer || 'School Administration',
      eventType: event.eventType,
      audience: event.targetAudience,
      status: event.status,
      isHoliday: event.isHoliday,
      source: 'calendar'
    }));
    
    // Format event events to match frontend expectations
    const formattedEventEvents = eventEvents.map(event => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.venue,
      organizer: event.organizer,
      eventType: 'Event', // Default type for events
      audience: event.audience,
      status: event.status,
      isHoliday: false,
      source: 'event'
    }));
    
    // Combine and sort all events
    const allEvents = [...formattedCalendarEvents, ...formattedEventEvents]
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    console.log('📅 Calendar events found:', calendarEvents.length);
    console.log('🎉 Event events found:', eventEvents.length);
    console.log('📊 Total events returned:', allEvents.length);
    
    res.json(allEvents);
  } catch (error) {
    console.error('Error fetching school calendar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's exam schedule
exports.getChildExamSchedule = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s exam schedule' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    const exams = await Exam.find({
      class: child.class,
      section: child.section,
      date: { $gte: new Date() }
    }).sort({ date: 1 });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching child exam schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 9. Health and Wellness

// Get child's health information
exports.getChildHealthInfo = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s health information' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Get health record
    const healthRecord = await HealthRecord.findOne({ studentId: child._id });
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found for this child' });
    }
    
    res.json(healthRecord);
  } catch (error) {
    console.error('Error fetching child health info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's health incidents
exports.getChildHealthIncidents = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s health incidents' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Get health record
    const healthRecord = await HealthRecord.findOne({ studentId: child._id });
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found for this child' });
    }
    
    // Return only incidents
    res.json(healthRecord.incidents);
  } catch (error) {
    console.error('Error fetching child health incidents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get child's counselor recommendations
exports.getChildCounselorRecommendations = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s counselor recommendations' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Get health record
    const healthRecord = await HealthRecord.findOne({ studentId: child._id });
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found for this child' });
    }
    
    // Return only counselor recommendations that are shared with parents
    const sharedRecommendations = healthRecord.counselorRecommendations.filter(
      rec => rec.isSharedWithParent
    );
    
    res.json(sharedRecommendations);
  } catch (error) {
    console.error('Error fetching child counselor recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 10. Document Center

// Get fee receipts
exports.getChildFeeReceipts = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s fee receipts' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Get fee payments
    const payments = await FeePayment.find({ studentId: child._id }).sort({ date: -1 });
    
    // Format receipts
    const receipts = payments.map(payment => ({
      receiptNumber: payment.receiptNumber,
      date: payment.date,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      components: payment.components,
      academicYear: payment.academicYear,
      term: payment.term,
      downloadUrl: `/api/parent/children/${rollNumber}/payment-receipts/${payment._id}/download`
    }));
    
    res.json(receipts);
  } catch (error) {
    console.error('Error fetching child fee receipts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get school policies and documents
exports.getSchoolDocuments = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = {
      isPublic: true,
      $or: [
        { targetAudience: { $in: ['Parents', 'All'] } }
      ]
    };
    
    if (type) {
      query.documentType = type;
    }
    
    const documents = await SchoolDocument.find(query).sort({ publishedDate: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching school documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get certificates
exports.getChildCertificates = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if child belongs to parent
    if (!parent.childRollNumbers.includes(rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to view this child\'s certificates' });
    }
    
    const child = await Student.findOne({ rollNumber });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Get certificates (assuming they're stored as SchoolDocuments with a specific type)
    const certificates = await SchoolDocument.find({
      documentType: 'Certificate',
      'metadata.studentId': child._id
    }).sort({ publishedDate: -1 });
    
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching child certificates:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Get children
    const children = await Student.find({
      rollNumber: { $in: parent.childRollNumbers }
    }).select('name rollNumber class section');

    // Get recent announcements
    const announcements = await Announcement.find({
      targetAudience: { $in: ['Parents', 'All'] }
    }).sort({ createdAt: -1 }).limit(5);

    // Get upcoming events
    const upcomingEvents = await Event.find({
      startDate: { $gte: new Date() },
      audience: { $in: ['Parents', 'All'] }
    }).sort({ startDate: 1 }).limit(5);

    res.json({
      children,
      announcements,
      upcomingEvents,
      totalChildren: children.length
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Profile
exports.getProfile = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id).select('-password');
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    res.json(parent);
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, contactNumber, address, emergencyContact } = req.body;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Update fields
    if (name) parent.name = name;
    if (contactNumber) parent.contactNumber = contactNumber;
    if (address) parent.address = address;
    if (emergencyContact) parent.emergencyContact = emergencyContact;

    await parent.save();
    
    res.json({ message: 'Profile updated successfully', parent });
  } catch (error) {
    console.error('Error updating parent profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    // This would typically handle file upload
    // For now, return a success message
    res.json({ message: 'Profile image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    // Return available payment methods
    res.json([
      { id: 'online', name: 'Online Payment', description: 'Credit/Debit Card or Net Banking' },
      { id: 'cash', name: 'Cash Payment', description: 'Pay at school office' },
      { id: 'cheque', name: 'Cheque Payment', description: 'Pay by cheque' }
    ]);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Make payment
exports.makePayment = async (req, res) => {
  try {
    const { studentId, amount, paymentMethod, components } = req.body;
    
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student belongs to parent
    if (!parent.childRollNumbers.includes(student.rollNumber)) {
      return res.status(403).json({ message: 'Not authorized to make payment for this student' });
    }
    
    // Create payment record
    const payment = new FeePayment({
      studentId: student._id,
      amount,
      paymentMethod,
      components,
      status: 'Completed',
      paymentDate: new Date(),
      transactionId: `TXN${Date.now()}`,
      receiptNumber: `RCP${Date.now()}`
    });
    
    await payment.save();
    
    res.status(201).json({ 
      message: 'Payment successful', 
      payment,
      receiptUrl: `/api/parents/children/${student.rollNumber}/payment-receipts/${payment._id}`
    });
  } catch (error) {
    console.error('Error making payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Link student to parent
exports.linkStudent = async (req, res) => {
  try {
    const { rollNumber } = req.body;
    
    console.log('🔗 Link request received:', { rollNumber, parentId: req.user.id });
    
    if (!rollNumber) {
      return res.status(400).json({ message: 'Roll number is required' });
    }

    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      console.log('❌ Parent not found:', req.user.id);
      return res.status(404).json({ message: 'Parent not found' });
    }

    console.log('✅ Parent found:', { name: parent.name, email: parent.email, childRollNumbers: parent.childRollNumbers });

    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      console.log('❌ Student not found with roll number:', rollNumber);
      return res.status(404).json({ message: 'Student not found with this roll number' });
    }

    console.log('✅ Student found:', { name: student.name, rollNumber: student.rollNumber, parents: student.parents });

    // Check if student is already linked to this parent
    if (parent.childRollNumbers.includes(rollNumber)) {
      console.log('❌ Student already linked to this parent');
      return res.status(400).json({ message: 'Student is already linked to your account' });
    }

    // Check if student already has any parents linked (optional single-parent rule)
    if (student.parents && student.parents.length > 0) {
      console.log('❌ Student already linked to other parent accounts:', student.parents);
      return res.status(400).json({ message: 'This student is already linked to another parent account' });
    }

    // Link student to parent
    parent.childRollNumbers.push(rollNumber);
    if (!parent.children) parent.children = [];
    parent.children.push(student._id);
    await parent.save();
    console.log('✅ Parent updated with new child:', parent.childRollNumbers);

    // Update student's parents array
    if (!student.parents) student.parents = [];
    student.parents.push(parent._id);
    await student.save();
    console.log('✅ Student updated with parent reference:', student.parents);

    res.json({ 
      message: 'Student linked successfully',
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section
      }
    });
  } catch (error) {
    console.error('❌ Error linking student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Debug endpoint
exports.debugParentData = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id);
    res.json({ parent, message: 'Debug data' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

