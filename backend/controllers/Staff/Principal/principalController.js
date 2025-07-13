const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');
const Class = require('../../../models/Admin/classModel');
const Department = require('../../../models/Staff/HOD/department.model');
const Event = require('../../../models/Admin/eventModel');
const Calendar = require('../../../models/Academic/calendarModel');
const Announcement = require('../../../models/Communication/announcementModel');
const FeeStructure = require('../../../models/Finance/feeStructureModel');
const ApprovalRequest = require('../../../models/Staff/HOD/approvalRequest.model');
const Communication = require('../../../models/Communication/communicationModel');
const FeePayment = require('../../../models/Finance/feePaymentModel');
const TeacherLeaveRequest = require('../../../models/Staff/HOD/teacherLeaveRequest.model');
const TeacherEvaluation = require('../../../models/Staff/HOD/teacherEvaluation.model');
const Attendance = require('../../../models/Staff/Teacher/attendance.model');
const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
const ReportCard = require('../../../models/Student/reportCardModel');
const Admission = require('../../../models/Admin/admissionModel');

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    console.log('🏫 Principal dashboard requested by:', req.user.id);

    // Get comprehensive counts and data from actual database
    const [
      totalStudents,
      totalStaff,
      totalClasses,
      totalDepartments,
      pendingApprovals,
      recentEvents,
      recentAnnouncements,
      feeStructures,
      feePayments,
      todayAttendance,
      activeStaff,
      newStudents,
      activeEvents
    ] = await Promise.all([
      Student.countDocuments(),
      Staff.countDocuments(),
      Class.countDocuments(),
      Department.countDocuments(),
      ApprovalRequest.countDocuments({ 
        status: 'Pending',
        currentApprover: 'Principal'
      }),
      Event.find({ status: 'Scheduled' }).sort({ startDate: 1 }).limit(5),
      Announcement.find({ status: 'Active' }).sort({ createdAt: -1 }).limit(5),
      FeeStructure.find({ isActive: true }),
      FeePayment.find({ 
        paymentDate: { 
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        } 
      }),
      // Calculate today's attendance from actual attendance records
      Student.countDocuments({ 
        'attendance.date': { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        },
        'attendance.status': 'Present'
      }),
      Staff.countDocuments({ status: 'Active' }),
      Student.countDocuments({ 
        createdAt: { 
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        } 
      }),
      Event.countDocuments({ status: 'Scheduled' })
    ]);

    // Get approval requests
    const approvalRequests = await ApprovalRequest.find({
      status: 'Pending',
      currentApprover: 'Principal'
    })
    .populate('requesterId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate fee collection percentage from actual data
    const totalFeeAmount = feeStructures.reduce((sum, fee) => sum + (fee.totalAmount || 0), 0);
    const collectedAmount = feePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const feeCollectionPercentage = totalFeeAmount > 0 ? Math.round((collectedAmount / totalFeeAmount) * 100) : 0;

    // Get real alerts from database (if you have an alerts model)
    const alerts = await Announcement.find({ 
      priority: { $in: ['high', 'medium'] },
      status: 'Active'
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title content priority createdAt');

    const dashboardData = {
      stats: {
        totalStudents,
        totalStaff,
        totalClasses,
        totalDepartments,
        pendingApprovals,
        todayAttendance,
        activeStaff,
        newStudents,
        activeEvents,
        feeCollection: feeCollectionPercentage
      },
      recentActivities: {
        events: recentEvents,
        announcements: recentAnnouncements
      },
      pendingApprovals: approvalRequests,
      alerts: alerts
    };

    console.log('📊 Dashboard data:', {
      students: totalStudents,
      staff: totalStaff,
      classes: totalClasses,
      departments: totalDepartments,
      pendingApprovals,
      todayAttendance,
      feeCollection: feeCollectionPercentage
    });

    res.json(dashboardData);
  } catch (error) {
    console.error('❌ Error fetching principal dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Profile Management
exports.getProfile = async (req, res) => {
  try {
    const principal = await Staff.findById(req.user.id).select('-password');
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' });
    }
    res.json(principal);
  } catch (error) {
    console.error('Error fetching principal profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, contactNumber, address } = req.body;
    
    const principal = await Staff.findByIdAndUpdate(
      req.user.id,
      { name, email, contactNumber, address },
      { new: true }
    ).select('-password');

    res.json(principal);
  } catch (error) {
    console.error('Error updating principal profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const principal = await Staff.findById(req.user.id);
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    // Verify current password
    const isMatch = await principal.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    principal.password = newPassword;
    await principal.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    // Handle file upload logic here
    res.json({ message: 'Profile image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approval System
exports.getPendingApprovals = async (req, res) => {
  try {
    const { type, status } = req.query;
    
    let query = {
      currentApprover: 'Principal'
    };

    if (type) {
      query.requestType = type;
    }

    if (status) {
      query.status = status;
    } else {
      query.status = 'Pending';
    }

    const approvals = await ApprovalRequest.find(query)
      .populate('requesterId', 'name email role')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${approvals.length} approval requests for Principal`);

    res.json(approvals);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getApprovalDetails = async (req, res) => {
  try {
    const { approvalId } = req.params;
    
    const approval = await ApprovalRequest.findById(approvalId)
      .populate('requesterId', 'name email role');

    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    res.json(approval);
  } catch (error) {
    console.error('Error fetching approval details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to map event types to valid Calendar model enum values
const mapEventTypeToCalendarEnum = (eventType) => {
  if (!eventType) return 'Event';
  
  const eventTypeLower = eventType.toLowerCase();
  
  // Map common event types to valid enum values
  switch (eventTypeLower) {
    case 'sports':
    case 'athletic':
    case 'competition':
      return 'Sports';
    case 'academic':
    case 'educational':
    case 'learning':
      return 'Academic';
    case 'exam':
    case 'examination':
    case 'test':
      return 'Exam';
    case 'holiday':
    case 'vacation':
    case 'break':
      return 'Holiday';
    case 'meeting':
    case 'conference':
    case 'gathering':
      return 'Meeting';
    case 'cultural':
    case 'celebration':
    case 'festival':
    case 'ceremony':
      return 'Cultural';
    default:
      // Check if it's already a valid enum value
      const validTypes = ['Academic', 'Exam', 'Holiday', 'Event', 'Meeting', 'Sports', 'Cultural', 'Other'];
      if (validTypes.includes(eventType)) {
        return eventType;
      }
      return 'Event'; // Default fallback
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { comments } = req.body;

    const approval = await ApprovalRequest.findById(approvalId);
    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    // Add principal approval
    approval.approvalHistory.push({
      approver: req.user.id,
      role: 'Principal',
      status: 'Approved',
      comments: comments || 'Approved by Principal',
      timestamp: new Date()
    });

    // Update status
    approval.status = 'Approved';
    approval.currentApprover = 'Completed';

    // Create the actual item based on request type
    let createdItem = null;
    
    if (approval.requestType === 'Event') {
      // Create event in Calendar collection
      const eventData = approval.requestData || {};
      console.log('📋 Event approval data:', {
        approvalId: approval._id,
        requestData: approval.requestData,
        eventData: eventData,
        title: eventData.title,
        venue: eventData.venue
      });
      
      // Handle double nesting if it exists
      let actualEventData = eventData;
      if (eventData.requestData) {
        console.log('⚠️ Detected double nesting, extracting from eventData.requestData');
        actualEventData = eventData.requestData;
      }
      
      console.log('📋 Actual event data after extraction:', actualEventData);
      
      // Map fields correctly for Calendar model
      const mappedEventData = {
        title: actualEventData.title || approval.title, // Use approval title if event title is missing
        description: actualEventData.description || approval.description,
        startDate: actualEventData.startDate || new Date(), // Default to now if missing
        endDate: actualEventData.endDate || new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour later if missing
        location: actualEventData.venue || actualEventData.location || 'TBD', // Map venue to location for Calendar model
        organizer: actualEventData.organizer || 'School Administration',
        eventType: mapEventTypeToCalendarEnum(actualEventData.eventType), // Map to valid enum value
        targetAudience: actualEventData.audience || ['All'], // Calendar model uses targetAudience
        createdBy: req.user.id
      };
      
      console.log('📋 Mapped event data for Calendar:', mappedEventData);
      
      // Validate required fields
      if (!mappedEventData.title) {
        throw new Error(`Missing required event field: title`);
      }
      
      // Ensure location is not empty (should have default 'TBD' if not provided)
      if (!mappedEventData.location || mappedEventData.location.trim() === '') {
        mappedEventData.location = 'TBD';
      }
      
      const newEvent = new Calendar({
        ...mappedEventData,
        status: 'Active' // Calendar model uses 'Active' status
      });
      createdItem = await newEvent.save();
      console.log(`📅 Calendar event created: ${newEvent.title}`);
      
    } else if (approval.requestType === 'Communication') {
      // Create communication/announcement
      const commData = approval.requestData || {};
      console.log('📋 Communication approval data:', {
        approvalId: approval._id,
        requestData: approval.requestData,
        commData: commData
      });
      
      // Handle double nesting if it exists
      let actualCommData = commData;
      if (commData.requestData) {
        console.log('⚠️ Detected double nesting in communication, extracting from commData.requestData');
        actualCommData = commData.requestData;
      }
      
      console.log('📋 Actual communication data after extraction:', actualCommData);
      
      const newCommunication = new Communication({
        subject: actualCommData.subject || approval.title,
        content: actualCommData.content || approval.description,
        recipients: actualCommData.recipients || ['All Students'],
        communicationType: actualCommData.communicationType || 'Announcement',
        scheduledDate: actualCommData.scheduledDate || new Date(),
        sentBy: req.user.id, // Required field - set to the principal who is approving
        status: 'Sent',
        sentDate: new Date()
      });
      createdItem = await newCommunication.save();
      console.log(`📢 Communication created: ${newCommunication.subject}`);
      
    } else if (approval.requestType === 'Fee') {
      // Create fee structure
      const feeData = approval.requestData || {};
      console.log('📋 Fee approval data:', {
        approvalId: approval._id,
        requestData: approval.requestData,
        feeData: feeData
      });
      
      // Handle double nesting if it exists
      let actualFeeData = feeData;
      if (feeData.requestData) {
        console.log('⚠️ Detected double nesting in fee, extracting from feeData.requestData');
        actualFeeData = feeData.requestData;
      }
      
      console.log('📋 Actual fee data after extraction:', actualFeeData);
      
      const newFee = new FeeStructure({
        academicYear: actualFeeData.academicYear,
        class: actualFeeData.class,
        term: actualFeeData.term || 'Annual',
        components: actualFeeData.components || [],
        feeComponents: actualFeeData.components || [],
        totalAmount: actualFeeData.totalAmount || 0,
        dueDate: actualFeeData.dueDate || new Date(),
        latePaymentFee: actualFeeData.latePaymentFee || 0,
        createdBy: req.user.id
      });
      createdItem = await newFee.save();
      console.log(`💰 Fee structure created: ${newFee.term} for ${newFee.class}`);
    } else if (approval.requestType === 'StudentFeeRecord') {
      // Create student fee record
      const StudentFeeRecord = require('../../../models/Finance/studentFeeRecordModel');
      const feeRecordData = approval.requestData || {};
      
      console.log('📋 Student Fee Record approval data:', feeRecordData);
      
      const newFeeRecord = new StudentFeeRecord({
        ...feeRecordData,
        createdBy: req.user.id,
        status: 'Approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      });
      
      createdItem = await newFeeRecord.save();
      console.log(`💰 Student fee record created for ${feeRecordData.studentName}`);
    } else if (approval.requestType === 'StaffSalaryRecord') {
      // Create staff salary record
      const StaffSalaryRecord = require('../../../models/Finance/staffSalaryRecordModel');
      const salaryRecordData = approval.requestData || {};
      
      console.log('📋 Staff Salary Record approval data:', salaryRecordData);
      
      const newSalaryRecord = new StaffSalaryRecord({
        ...salaryRecordData,
        createdBy: req.user.id,
        status: 'Approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      });
      
      createdItem = await newSalaryRecord.save();
      console.log(`💰 Staff salary record created for ${salaryRecordData.staffName}`);
    } else if (approval.requestType === 'Leave') {
      // Handle teacher leave request approval
      const leaveData = approval.requestData || {};
      console.log('📋 Leave approval data:', {
        approvalId: approval._id,
        requestData: approval.requestData,
        leaveData: leaveData
      });
      
      if (leaveData.leaveRequestId) {
        // Update the linked TeacherLeaveRequest
        const leaveRequest = await TeacherLeaveRequest.findById(leaveData.leaveRequestId);
        if (leaveRequest) {
          leaveRequest.status = 'Approved';
          leaveRequest.processedBy = req.user.id;
          leaveRequest.processedAt = new Date();
          leaveRequest.hodComments = comments || 'Approved by Principal';
          await leaveRequest.save();
          
          createdItem = leaveRequest;
          console.log(`✅ Teacher leave request approved: ${leaveRequest._id}`);
        } else {
          console.log(`⚠️ Linked leave request not found: ${leaveData.leaveRequestId}`);
        }
      }
    } else if (approval.requestType === 'ServiceRequest') {
      // Just mark as approved and completed, no extra model creation
      console.log('📋 Service Request approved:', approval.requestData);
      // No additional action needed
    }

    await approval.save();

    console.log(`✅ Principal approved request: ${approvalId} - ${approval.requestType}`);

    res.json({ 
      message: 'Request approved successfully',
      approval,
      createdItem
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { comments } = req.body;

    const approval = await ApprovalRequest.findById(approvalId);
    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    // Add principal rejection
    approval.approvalHistory.push({
      approver: req.user.id,
      role: 'Principal',
      status: 'Rejected',
      comments: comments || 'Rejected by Principal',
      timestamp: new Date()
    });

    approval.status = 'Rejected';
    approval.currentApprover = 'Completed';

    // Handle teacher leave request rejection
    if (approval.requestType === 'Leave') {
      const leaveData = approval.requestData || {};
      if (leaveData.leaveRequestId) {
        const leaveRequest = await TeacherLeaveRequest.findById(leaveData.leaveRequestId);
        if (leaveRequest) {
          leaveRequest.status = 'Rejected';
          leaveRequest.processedBy = req.user.id;
          leaveRequest.processedAt = new Date();
          leaveRequest.hodComments = comments || 'Rejected by Principal';
          await leaveRequest.save();
          
          console.log(`❌ Teacher leave request rejected: ${leaveRequest._id}`);
        }
      }
    }

    await approval.save();

    console.log(`❌ Principal rejected request: ${approvalId}`);

    res.json({ 
      message: 'Request rejected successfully',
      approval 
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getApprovalHistory = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    
    let query = {
      $or: [
        { 'approvalHistory.role': 'Principal' },
        { currentApprover: 'Principal' }
      ]
    };

    if (type) {
      query.requestType = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const approvals = await ApprovalRequest.find(query)
      .populate('requesterId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(approvals);
  } catch (error) {
    console.error('Error fetching approval history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all approvals for principal (for tabs functionality)
exports.getAllApprovals = async (req, res) => {
  try {
    const { type, status } = req.query;
    
    let query = {
      $or: [
        { 'approvalHistory.role': 'Principal' },
        { currentApprover: 'Principal' }
      ]
    };

    if (type) {
      query.requestType = type;
    }

    if (status) {
      query.status = status;
    }

    const approvals = await ApprovalRequest.find(query)
      .populate('requesterId', 'name email role')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${approvals.length} total approval requests for Principal`);

    res.json(approvals);
  } catch (error) {
    console.error('Error fetching all approvals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// School Management
exports.getSchoolInfo = async (req, res) => {
  try {
    // This would typically fetch from a school settings model
    const schoolInfo = {
      name: 'EDULIVES School',
      address: '123 Education Street, Learning City',
      phone: '+1234567890',
      email: 'info@EDULIVES.edu',
      website: 'www.EDULIVES.edu',
      established: '2010',
      principal: req.user.name
    };

    res.json(schoolInfo);
  } catch (error) {
    console.error('Error fetching school info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSchoolInfo = async (req, res) => {
  try {
    // Update school information logic
    res.json({ message: 'School information updated successfully' });
  } catch (error) {
    console.error('Error updating school info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Department Management
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('headOfDepartment', 'name email')
      .populate('vicePrincipal', 'name email');

    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const department = await Department.findByIdAndUpdate(departmentId, req.body, { new: true });
    res.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    await Department.findByIdAndDelete(departmentId);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDepartmentDetails = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const department = await Department.findById(departmentId)
      .populate('headOfDepartment', 'name email')
      .populate('vicePrincipal', 'name email');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Error fetching department details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student Management
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('parents', 'name email contactNumber')
      .sort({ name: 1 });

    console.log(`📚 Found ${students.length} students`);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId)
      .populate('parents', 'name email contactNumber');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    // Get all students
    const students = await Student.find({ status: 'Active' }).select('name class section rollNumber');
    
    // Get all attendance records
    const attendanceRecords = await Attendance.find();
    
    const attendanceData = students.map(student => {
      // Find attendance records for this student
      const studentAttendance = attendanceRecords.filter(record => 
        record.attendanceData.some(data => data.studentRollNumber === student.rollNumber)
      );
      
      // Calculate attendance statistics
      let totalDays = 0;
      let presentDays = 0;
      
      studentAttendance.forEach(record => {
        const studentData = record.attendanceData.find(data => data.studentRollNumber === student.rollNumber);
        if (studentData) {
          totalDays++;
          if (studentData.status === 'Present') {
            presentDays++;
          }
        }
      });
      
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      return {
        _id: student._id,
        studentName: student.name,
        class: student.class,
        section: student.section,
        rollNumber: student.rollNumber,
        presentDays,
        totalDays,
        attendancePercentage
      };
    });

    res.json(attendanceData);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentPerformance = async (req, res) => {
  try {
    // Use report cards for overall performance
    const reportCards = await ReportCard.find().populate('studentId', 'name class');
    const performanceData = reportCards.map(rc => ({
      _id: rc.studentId?._id,
      studentId: rc.studentId?._id,
      studentName: rc.studentId?.name,
      class: rc.class,
      overallGrade: rc.averagePercentage,
      subjects: rc.subjects.map(s => ({ name: s.name, grade: s.marks })),
      term: rc.term,
      academicYear: rc.academicYear
    }));
    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Staff Management
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
      .select('-password')
      .sort({ name: 1 });

    console.log(`👥 Found ${staff.length} staff members`);
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStaffDetails = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findById(staffId).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Staff Leave Requests (REAL DATA)
exports.getLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await TeacherLeaveRequest.find()
      .populate('teacherId', 'name email role department contactNumber')
      .sort({ createdAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Staff Performance (REAL DATA)
exports.getStaffPerformance = async (req, res) => {
  try {
    // Get staff members with Teacher or HOD role
    const staff = await Staff.find({ role: { $in: ['Teacher', 'HOD'] } });
    const performanceData = await Promise.all(staff.map(async member => {
      // Get attendance data
      const attendance = member.attendance || [];
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      
      // Get latest evaluation data
      const latestEvaluation = await TeacherEvaluation.findOne({
        teacherId: member._id,
        status: 'Completed'
      }).sort({ date: -1 });
      
      const performanceScore = latestEvaluation?.overallRating || 0;
      const rating = latestEvaluation?.overallRating || 0;
      
      return {
        _id: member._id,
        staffName: member.name,
        role: member.role,
        department: member.department,
        attendance: attendancePercent,
        performanceScore: performanceScore,
        rating: rating,
        lastEvaluation: latestEvaluation?.date || null
      };
    }));
    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching staff performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admissions
exports.getAdmissions = async (req, res) => {
  try {
    const { status, class: applyingClass, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (applyingClass) query.applyingForClass = applyingClass;
    
    const skip = (page - 1) * limit;
    
    const admissions = await Admission.find(query)
      .populate('reviewedBy', 'name email')
      .populate('studentId', 'name rollNumber')
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Admission.countDocuments(query);
    
    // Get admission statistics
    const stats = await Admission.getAdmissionStats();
    const byClass = await Admission.getAdmissionsByClass();
    
    res.json({
      admissions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      },
      stats,
      byClass
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveAdmission = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { reviewNotes, admissionFee, enrollmentDate } = req.body;
    
    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ message: 'Admission application not found' });
    }
    
    admission.status = 'Approved';
    admission.reviewedBy = req.user.id;
    admission.reviewDate = new Date();
    admission.reviewNotes = reviewNotes;
    admission.admissionFee = admissionFee || admission.admissionFee;
    admission.enrollmentDate = enrollmentDate || new Date();
    
    await admission.save();
    
    res.json({ 
      message: 'Admission approved successfully',
      admission 
    });
  } catch (error) {
    console.error('Error approving admission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectAdmission = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { reviewNotes, rejectionReason } = req.body;
    
    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ message: 'Admission application not found' });
    }
    
    admission.status = 'Rejected';
    admission.reviewedBy = req.user.id;
    admission.reviewDate = new Date();
    admission.reviewNotes = reviewNotes;
    admission.rejectionReason = rejectionReason;
    
    await admission.save();
    
    res.json({ 
      message: 'Admission rejected successfully',
      admission 
    });
  } catch (error) {
    console.error('Error rejecting admission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdmissionDetails = async (req, res) => {
  try {
    const { admissionId } = req.params;
    
    const admission = await Admission.findById(admissionId)
      .populate('reviewedBy', 'name email')
      .populate('studentId', 'name rollNumber class')
      .populate('createdBy', 'name email');
    
    if (!admission) {
      return res.status(404).json({ message: 'Admission application not found' });
    }
    
    res.json(admission);
  } catch (error) {
    console.error('Error fetching admission details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAdmissionStatus = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { status, reviewNotes } = req.body;
    
    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ message: 'Admission application not found' });
    }
    
    admission.status = status;
    admission.reviewedBy = req.user.id;
    admission.reviewDate = new Date();
    if (reviewNotes) admission.reviewNotes = reviewNotes;
    
    await admission.save();
    
    res.json({ 
      message: 'Admission status updated successfully',
      admission 
    });
  } catch (error) {
    console.error('Error updating admission status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave Management
exports.approveLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, comments } = req.body;

    const leaveRequest = await TeacherLeaveRequest.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leaveRequest.status = status || 'Approved';
    leaveRequest.processedBy = req.user.id;
    leaveRequest.processedAt = new Date();
    if (comments) {
      leaveRequest.hodComments = comments;
    }

    await leaveRequest.save();

    console.log(`✅ Leave request ${leaveId} approved by Principal`);

    res.json({ 
      message: `Leave request ${leaveRequest.status} successfully`,
      leaveRequest 
    });
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, comments } = req.body;

    const leaveRequest = await TeacherLeaveRequest.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leaveRequest.status = status || 'Rejected';
    leaveRequest.processedBy = req.user.id;
    leaveRequest.processedAt = new Date();
    if (comments) {
      leaveRequest.hodComments = comments;
    }

    await leaveRequest.save();

    console.log(`❌ Leave request ${leaveId} rejected by Principal`);

    res.json({ 
      message: `Leave request ${leaveRequest.status} successfully`,
      leaveRequest 
    });
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reports
exports.getSchoolReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Generate school reports logic
    const reports = {
      studentEnrollment: await Student.countDocuments(),
      staffCount: await Staff.countDocuments(),
      classCount: await Class.countDocuments(),
      departmentCount: await Department.countDocuments()
    };

    res.json(reports);
  } catch (error) {
    console.error('Error generating school reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDepartmentReports = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('headOfDepartment', 'name email')
      .populate('vicePrincipal', 'name email');

    res.json(departments);
  } catch (error) {
    console.error('Error generating department reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStaffReports = async (req, res) => {
  try {
    const staff = await Staff.find().select('-password');
    res.json(staff);
  } catch (error) {
    console.error('Error generating staff reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Communication
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Announcement.find({ 
      targetAudience: { $in: ['All', 'Principal'] },
      status: 'Active' 
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    // Fetch messages logic
    res.json([]);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    // Send message logic
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Academic Management
exports.getAcademicYear = async (req, res) => {
  try {
    // Mock academic year data - in real implementation, this would come from academic year model
    const academicYear = {
      currentYear: '2024-2025',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      isActive: true
    };

    res.json(academicYear);
  } catch (error) {
    console.error('Error fetching academic year:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAcademicYear = async (req, res) => {
  try {
    // Update academic year logic
    res.json({ message: 'Academic year updated successfully' });
  } catch (error) {
    console.error('Error updating academic year:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Calendar.find({ 
      eventType: 'Holiday',
      isHoliday: true 
    }).sort({ startDate: 1 });

    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const holiday = new Calendar({
      ...req.body,
      eventType: 'Holiday',
      isHoliday: true,
      createdBy: req.user.id
    });
    await holiday.save();
    res.status(201).json(holiday);
  } catch (error) {
    console.error('Error creating holiday:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const holiday = await Calendar.findByIdAndUpdate(holidayId, req.body, { new: true });
    res.json(holiday);
  } catch (error) {
    console.error('Error updating holiday:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    await Calendar.findByIdAndDelete(holidayId);
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get curriculum details for a specific class
exports.getClassCurriculumDetails = async (req, res) => {
  try {
    const { className } = req.params;
    console.log(`🔍 Fetching curriculum details for class: ${className}`);
    
    // Get all staff members who teach this class
    const teachers = await Staff.find({
      role: 'Teacher',
      'assignedSubjects.class': className
    }).select('name email assignedSubjects');

    console.log(`👨‍🏫 Found ${teachers.length} teachers for class ${className}`);

    // Get students in this class
    const students = await Student.find({ class: className })
      .select('name rollNumber section')
      .sort({ section: 1, rollNumber: 1 });

    console.log(`👥 Found ${students.length} students for class ${className}`);

    // Get subjects for this class - more robust query
    const subjects = await Staff.aggregate([
      { $unwind: '$assignedSubjects' },
      { $match: { 'assignedSubjects.class': className } },
      { $group: { 
        _id: '$assignedSubjects.subject',
        teachers: { $addToSet: { 
          teacherId: '$_id',
          name: '$name',
          email: '$email'
        }}
      }},
      { $project: {
        subject: '$_id',
        teachers: 1,
        _id: 0
      }}
    ]);

    console.log(`📚 Found ${subjects.length} subjects for class ${className}:`, subjects.map(s => s.subject));

    // Get class statistics
    const classStats = {
      totalStudents: students.length,
      totalSubjects: subjects.length,
      totalTeachers: teachers.length,
      sections: [...new Set(students.map(s => s.section))].length
    };

    // Fix teacher count - count unique teachers from subjects
    const uniqueTeacherIds = new Set();
    subjects.forEach(subject => {
      subject.teachers.forEach(teacher => {
        uniqueTeacherIds.add(teacher.teacherId.toString());
      });
    });
    classStats.totalTeachers = uniqueTeacherIds.size;

    console.log(`📊 Class statistics:`, classStats);

    // Group students by section
    const studentsBySection = students.reduce((acc, student) => {
      if (!acc[student.section]) {
        acc[student.section] = [];
      }
      acc[student.section].push(student);
      return acc;
    }, {});

    const curriculumDetails = {
      className,
      classStats,
      subjects,
      teachers: teachers.map(teacher => ({
        teacherId: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subjects: teacher.assignedSubjects.filter(sub => sub.class === className)
      })),
      studentsBySection,
      totalStudents: students
    };

    console.log(`📚 Curriculum details fetched for class ${className}:`, {
      students: students.length,
      teachers: teachers.length,
      subjects: subjects.length,
      sections: Object.keys(studentsBySection).length
    });

    res.json(curriculumDetails);
  } catch (error) {
    console.error('Error fetching class curriculum details:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      className: req.params.className 
    });
  }
};

// Get curriculum overview for all classes
exports.getCurriculumOverview = async (req, res) => {
  try {
    // Get all unique classes from staff assignments
    const classData = await Staff.aggregate([
      { $unwind: '$assignedSubjects' },
      { 
        $group: { 
          _id: '$assignedSubjects.class',
          subjects: { $addToSet: '$assignedSubjects.subject' },
          teachers: { $addToSet: '$_id' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get student counts for each class
    const studentCounts = await Student.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } }
    ]);

    // Create a map of class to student count
    const studentCountMap = {};
    studentCounts.forEach(item => {
      studentCountMap[item._id] = item.count;
    });

    // Transform the data for frontend
    const curriculumOverview = classData.map(classInfo => {
      const className = classInfo._id;
      const subjects = classInfo.subjects;
      const teacherCount = classInfo.teachers.length;
      const studentCount = studentCountMap[className] || 0;

      return {
        className,
        subjects: subjects.join(', '),
        teacherCount,
        studentCount,
        hasData: true
      };
    });

    // If no data found, return empty array
    if (curriculumOverview.length === 0) {
      console.log('📚 No curriculum data found in database');
      res.json([]);
      return;
    }

    console.log(`📚 Curriculum overview: Found ${curriculumOverview.length} classes`);

    res.json(curriculumOverview);
  } catch (error) {
    console.error('Error fetching curriculum overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Debug function to check database data
exports.debugCurriculumData = async (req, res) => {
  try {
    console.log('🔍 Debugging curriculum data...');
    
    // Check staff data
    const allStaff = await Staff.find({ role: 'Teacher' }).select('name assignedSubjects');
    console.log(`👨‍🏫 Total teachers: ${allStaff.length}`);
    
    const staffWithAssignments = allStaff.filter(staff => 
      staff.assignedSubjects && staff.assignedSubjects.length > 0
    );
    console.log(`👨‍🏫 Teachers with assignments: ${staffWithAssignments.length}`);
    
    // Check student data
    const allStudents = await Student.find().select('name class section');
    console.log(`👥 Total students: ${allStudents.length}`);
    
    const studentsByClass = {};
    allStudents.forEach(student => {
      if (!studentsByClass[student.class]) {
        studentsByClass[student.class] = 0;
      }
      studentsByClass[student.class]++;
    });
    console.log(`👥 Students by class:`, studentsByClass);
    
    // Check staff assignments
    const assignments = [];
    allStaff.forEach(staff => {
      if (staff.assignedSubjects) {
        staff.assignedSubjects.forEach(assignment => {
          assignments.push({
            teacher: staff.name,
            class: assignment.class,
            subject: assignment.subject
          });
        });
      }
    });
    console.log(`📚 Staff assignments:`, assignments);
    
    const debugData = {
      totalTeachers: allStaff.length,
      teachersWithAssignments: staffWithAssignments.length,
      totalStudents: allStudents.length,
      studentsByClass,
      assignments,
      sampleStaff: allStaff.slice(0, 3).map(s => ({
        name: s.name,
        assignedSubjects: s.assignedSubjects
      })),
      sampleStudents: allStudents.slice(0, 3).map(s => ({
        name: s.name,
        class: s.class,
        section: s.section
      }))
    };
    
    res.json(debugData);
  } catch (error) {
    console.error('Error debugging curriculum data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all examinations for principal
exports.getAllExaminations = async (req, res) => {
  try {
    const Exam = require('../../../models/Staff/Teacher/exam.model');
    const VPExam = require('../../../models/Staff/HOD/examPaper.model');
    
    // Get both teacher-created exams and VP-scheduled exams
    const [teacherExams, vpExams] = await Promise.all([
      Exam.find().populate('createdBy', 'name'),
      VPExam.find().populate('createdBy', 'name')
    ]);

    // Transform and combine the exams
    const allExams = [
      ...teacherExams.map(exam => ({
        ...exam.toObject(),
        source: 'Teacher',
        examType: 'Regular'
      })),
      ...vpExams.map(exam => ({
        ...exam.toObject(),
        source: 'VP',
        examType: 'Scheduled'
      }))
    ];

    // Sort by date
    allExams.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`📝 Found ${allExams.length} total examinations`);

    res.json(allExams);
  } catch (error) {
    console.error('Error fetching examinations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get academic results for principal
exports.getAcademicResults = async (req, res) => {
  try {
    const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
    const Exam = require('../../../models/Staff/Teacher/exam.model');
    
    // Get all exam results with exam details
    const examResults = await ExamResult.find()
      .populate('examId', 'title class section subject date type')
      .populate('studentId', 'name rollNumber class section')
      .populate('enteredBy', 'name')
      .sort({ createdAt: -1 });

    // Group results by class and subject
    const resultsByClass = {};
    const resultsBySubject = {};

    examResults.forEach(result => {
      if (result.examId && result.studentId) {
        const classKey = `${result.examId.class}-${result.examId.section}`;
        const subjectKey = result.examId.subject;

        // Group by class
        if (!resultsByClass[classKey]) {
          resultsByClass[classKey] = {
            class: result.examId.class,
            section: result.examId.section,
            totalStudents: 0,
            totalExams: 0,
            averageScore: 0,
            results: []
          };
        }

        // Group by subject
        if (!resultsBySubject[subjectKey]) {
          resultsBySubject[subjectKey] = {
            subject: subjectKey,
            totalStudents: 0,
            totalExams: 0,
            averageScore: 0,
            results: []
          };
        }

        // Add to class results
        resultsByClass[classKey].results.push(result);
        resultsByClass[classKey].totalStudents = new Set(resultsByClass[classKey].results.map(r => r.studentId._id)).size;
        resultsByClass[classKey].totalExams = new Set(resultsByClass[classKey].results.map(r => r.examId._id)).size;

        // Add to subject results
        resultsBySubject[subjectKey].results.push(result);
        resultsBySubject[subjectKey].totalStudents = new Set(resultsBySubject[subjectKey].results.map(r => r.studentId._id)).size;
        resultsBySubject[subjectKey].totalExams = new Set(resultsBySubject[subjectKey].results.map(r => r.examId._id)).size;
      }
    });

    // Calculate averages
    Object.keys(resultsByClass).forEach(classKey => {
      const classData = resultsByClass[classKey];
      const totalScore = classData.results.reduce((sum, r) => sum + (r.score || 0), 0);
      classData.averageScore = classData.results.length > 0 ? totalScore / classData.results.length : 0;
    });

    Object.keys(resultsBySubject).forEach(subjectKey => {
      const subjectData = resultsBySubject[subjectKey];
      const totalScore = subjectData.results.reduce((sum, r) => sum + (r.score || 0), 0);
      subjectData.averageScore = subjectData.results.length > 0 ? totalScore / subjectData.results.length : 0;
    });

    const academicResults = {
      totalResults: examResults.length,
      resultsByClass,
      resultsBySubject,
      recentResults: examResults.slice(0, 20) // Last 20 results
    };

    console.log(`📊 Found ${examResults.length} academic results`);

    res.json(academicResults);
  } catch (error) {
    console.error('Error fetching academic results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance overview for principal
exports.getAttendanceOverview = async (req, res) => {
  try {
    const Attendance = require('../../../models/Staff/Teacher/attendance.model');
    const Student = require('../../../models/Student/studentModel');
    
    // Get all students
    const students = await Student.find({ status: 'Active' })
      .select('name rollNumber class section')
      .sort({ class: 1, section: 1, rollNumber: 1 });

    // Get all attendance records
    const attendanceRecords = await Attendance.find()
      .sort({ date: -1 })
      .limit(100); // Last 100 attendance records

    // Calculate attendance statistics by class
    const attendanceByClass = {};
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    students.forEach(student => {
      const classKey = `${student.class}-${student.section}`;
      
      if (!attendanceByClass[classKey]) {
        attendanceByClass[classKey] = {
          class: student.class,
          section: student.section,
          totalStudents: 0,
          presentToday: 0,
          absentToday: 0,
          presentThisMonth: 0,
          totalDaysThisMonth: 0,
          averageAttendance: 0,
          students: []
        };
      }

      attendanceByClass[classKey].totalStudents++;
      attendanceByClass[classKey].students.push({
        name: student.name,
        rollNumber: student.rollNumber,
        attendancePercentage: 0
      });
    });

    // Calculate attendance for each student
    students.forEach(student => {
      const classKey = `${student.class}-${student.section}`;
      const studentAttendance = attendanceRecords.filter(record => 
        record.attendanceData.some(data => data.studentRollNumber === student.rollNumber)
      );

      let totalDays = 0;
      let presentDays = 0;
      let presentToday = false;
      let presentThisMonth = 0;
      let totalDaysThisMonth = 0;

      studentAttendance.forEach(record => {
        const studentData = record.attendanceData.find(data => data.studentRollNumber === student.rollNumber);
        if (studentData) {
          totalDays++;
          if (studentData.status === 'Present') {
            presentDays++;
            
            // Check if present today
            if (record.date.toDateString() === today.toDateString()) {
              presentToday = true;
            }
            
            // Check if present this month
            if (record.date >= thisMonth) {
              presentThisMonth++;
            }
          }
          
          // Count total days this month
          if (record.date >= thisMonth) {
            totalDaysThisMonth++;
          }
        }
      });

      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      // Update class statistics
      if (presentToday) {
        attendanceByClass[classKey].presentToday++;
      } else {
        attendanceByClass[classKey].absentToday++;
      }

      attendanceByClass[classKey].presentThisMonth += presentThisMonth;
      attendanceByClass[classKey].totalDaysThisMonth = Math.max(attendanceByClass[classKey].totalDaysThisMonth, totalDaysThisMonth);

      // Update student attendance percentage
      const studentIndex = attendanceByClass[classKey].students.findIndex(s => s.rollNumber === student.rollNumber);
      if (studentIndex !== -1) {
        attendanceByClass[classKey].students[studentIndex].attendancePercentage = attendancePercentage;
      }
    });

    // Calculate class averages
    Object.keys(attendanceByClass).forEach(classKey => {
      const classData = attendanceByClass[classKey];
      const totalPercentage = classData.students.reduce((sum, s) => sum + s.attendancePercentage, 0);
      classData.averageAttendance = classData.students.length > 0 ? Math.round(totalPercentage / classData.students.length) : 0;
    });

    const attendanceOverview = {
      totalStudents: students.length,
      totalClasses: Object.keys(attendanceByClass).length,
      attendanceByClass,
      recentAttendance: attendanceRecords.slice(0, 10) // Last 10 attendance records
    };

    console.log(`📊 Attendance overview generated for ${students.length} students`);

    res.json(attendanceOverview);
  } catch (error) {
    console.error('Error fetching attendance overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// Lesson Plan Approval Functions
const LessonPlan = require('../../../models/Staff/Teacher/lessonplan.model');

// Get lesson plans pending Principal approval
exports.getLessonPlansForApproval = async (req, res) => {
  console.log('🔍 Principal getLessonPlansForApproval called');
  console.log('👤 Principal User ID:', req.user.id);
  
  try {
    // First check all lesson plans to see what's in the database
    const allLessonPlans = await LessonPlan.find({});
    console.log(`📋 Total lesson plans in database: ${allLessonPlans.length}`);
    
    allLessonPlans.forEach((lp, index) => {
      console.log(`📄 Lesson Plan ${index + 1}:`, {
        id: lp._id,
        title: lp.title,
        status: lp.status,
        currentApprover: lp.currentApprover,
        submittedBy: lp.submittedBy
      });
    });
    
    const lessonPlans = await LessonPlan.find({
      status: 'HOD_Approved',
      currentApprover: 'Principal'
    })
    .populate('submittedBy', 'name email department')
    .populate('hodApprovedBy', 'name email')
    .sort({ hodApprovedAt: -1 });
    
    console.log(`📋 Found ${lessonPlans.length} lesson plans for Principal approval`);
    console.log('📋 Lesson plans:', lessonPlans.map(lp => ({ 
      id: lp._id, 
      title: lp.title, 
      submittedBy: lp.submittedBy?.name,
      department: lp.submittedBy?.department?.name || 'No department'
    })));
    
    res.json(lessonPlans);
  } catch (error) {
    console.error('Error fetching lesson plans for approval:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve or reject lesson plan
exports.approveLessonPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { status, feedback, templateData } = req.body;
    
    const lessonPlan = await LessonPlan.findById(planId);
    
    if (!lessonPlan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    
    // If templateData is provided, update the lesson plan with the new template data
    if (templateData) {
      console.log('📝 Updating lesson plan template data');
      lessonPlan.templateData = templateData;
      
      // Also update the main fields if they're in the template data
      if (templateData.title) {
        lessonPlan.title = templateData.title;
      }
      if (templateData.topic) {
        lessonPlan.description = templateData.topic;
      }
      if (templateData.class) {
        lessonPlan.class = templateData.class;
      }
      if (templateData.subject) {
        lessonPlan.subject = templateData.subject;
      }
    }
    
    // If status is provided, process the approval/rejection workflow
    if (status) {
      // Check if lesson plan is ready for Principal review
      if (lessonPlan.status !== 'HOD_Approved' || lessonPlan.currentApprover !== 'Principal') {
        return res.status(400).json({ message: 'Lesson plan is not ready for Principal review' });
      }
      
      if (status === 'Rejected') {
        // Principal rejected the lesson plan
        lessonPlan.status = 'Rejected';
        lessonPlan.currentApprover = 'Completed';
        lessonPlan.rejectedBy = req.user.id;
        lessonPlan.rejectedAt = new Date();
        lessonPlan.rejectionReason = feedback || 'Rejected by Principal';
      } else if (status === 'Principal_Approved') {
        // Principal approved, publish the lesson plan
        lessonPlan.status = 'Published';
        lessonPlan.currentApprover = 'Completed';
        lessonPlan.isPublished = true;
        lessonPlan.principalApprovedBy = req.user.id;
        lessonPlan.principalApprovedAt = new Date();
        lessonPlan.principalFeedback = feedback || 'Approved by Principal';
      } else {
        return res.status(400).json({ message: 'Invalid status for Principal review' });
      }
    }
    
    await lessonPlan.save();
    
    const message = templateData && !status 
      ? 'Template updated successfully' 
      : status === 'Rejected' 
        ? 'Lesson plan rejected' 
        : 'Lesson plan approved and published';
    
    res.json({ 
      message,
      lessonPlan 
    });
  } catch (error) {
    console.error('Error approving lesson plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all lesson plans (for Principal overview)
exports.getAllLessonPlans = async (req, res) => {
  try {
    const lessonPlans = await LessonPlan.find()
      .populate('submittedBy', 'name email')
      .populate('hodApprovedBy', 'name email')
      .populate('principalApprovedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(lessonPlans);
  } catch (error) {
    console.error('Error fetching all lesson plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 