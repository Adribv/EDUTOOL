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

// School Management
exports.getSchoolInfo = async (req, res) => {
  try {
    // This would typically fetch from a school settings model
    const schoolInfo = {
      name: 'EduRays School',
      address: '123 Education Street, Learning City',
      phone: '+1234567890',
      email: 'info@edurays.edu',
      website: 'www.edurays.edu',
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
      .populate('hod', 'name email')
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
      .populate('hod', 'name email')
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
      .populate('parentId', 'name email contactNumber')
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
      .populate('parentId', 'name email contactNumber');

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
    // Get real attendance data from the database
    const students = await Student.find({ status: 'Active' })
      .populate('attendance')
      .select('name class attendance');

    const attendanceData = students.map(student => {
      // Calculate attendance from actual attendance records
      const totalDays = student.attendance?.length || 0;
      const presentDays = student.attendance?.filter(att => att.status === 'Present').length || 0;
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      return {
        _id: student._id,
        studentName: student.name,
        class: student.class,
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
    // Optionally, you can join with teacherEvaluation.model.js for richer data
    const staff = await Staff.find({ role: { $in: ['Teacher', 'HOD'] } });
    const performanceData = await Promise.all(staff.map(async member => {
      // Attendance: count present days from attendance model if available
      // For now, just count total days in the system as a placeholder
      // You can enhance this with a real attendance model
      const attendance = member.attendanceRecords || [];
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'Present').length;
      const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      // Performance: use teacherEvaluation.model.js if available
      return {
        _id: member._id,
        staffName: member.name,
        role: member.role,
        attendance: attendancePercent,
        performanceScore: member.performanceScore || 0, // Replace with real evaluation if available
        rating: member.rating || 0 // Replace with real evaluation if available
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
    const { status } = req.body;

    // In real implementation, this would update the leave request record
    console.log(`✅ Leave request ${leaveId} ${status} by Principal`);

    res.json({ message: `Leave request ${status} successfully` });
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    // In real implementation, this would update the leave request record
    console.log(`❌ Leave request ${leaveId} ${status} by Principal`);

    res.json({ message: `Leave request ${status} successfully` });
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
      .populate('hod', 'name email')
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