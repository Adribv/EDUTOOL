const Staff = require('../../models/Staff/staffModel');
const Student = require('../../models/Student/studentModel');
const ClassModel = require('../../models/Admin/classModel');
const Parent = require('../../models/Parent/parentModel');
const Calendar = require('../../models/Academic/calendarModel');
const StudentLeaveRequest = require('../../models/Student/studentLeaveRequestModel');
const ExamPaper = require('../../models/Staff/HOD/examPaper.model');

// Staff Dashboard - Real data based on coordinator role
exports.getStaffDashboard = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    
    // Get staff details with coordinator classes
    const staff = await Staff.findById(staffId)
      .populate('coordinator', '_id name grade section')
      .select('-password');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Get classes this staff coordinates
    const coordinatedClasses = staff.coordinator || [];
    
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

    // Get parents of these students
    const studentRollNumbers = students.map(student => student.rollNumber);
    const parents = await Parent.find({
      childRollNumbers: { $in: studentRollNumbers }
    });

    // Get today's events
    const today = new Date();
    const todayEvents = await Calendar.find({
      startDate: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      },
      status: 'Active'
    }).sort({ startDate: 1 });

    // Get upcoming events (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const upcomingEvents = await Calendar.find({
      startDate: { $gte: today, $lte: nextWeek },
      status: 'Active'
    }).sort({ startDate: 1 }).limit(5);

    // Get pending leave requests for coordinated students
    const studentIds = students.map(student => student._id);
    const pendingLeaveRequests = await StudentLeaveRequest.find({
      studentId: { $in: studentIds },
      status: 'Pending'
    }).populate('studentId', 'name rollNumber class section');

    // Calculate statistics
    const stats = {
      classes: coordinatedClasses.length,
      students: students.length,
      parents: parents.length,
      todayEvents: todayEvents.length,
      upcomingEvents: upcomingEvents.length,
      pendingLeaveRequests: pendingLeaveRequests.length
    };

    // Get recent activities (placeholder - you can enhance this)
    const recentActivities = todayEvents.map(event => ({
      type: 'event',
      title: event.title,
      date: event.startDate,
      status: 'today'
    }));

    // Get notifications (placeholder - you can enhance this)
    const notifications = [
      {
        message: `You are coordinating ${coordinatedClasses.length} classes`,
        time: new Date().toLocaleTimeString(),
        type: 'info'
      },
      {
        message: `${students.length} students under your coordination`,
        time: new Date().toLocaleTimeString(),
        type: 'info'
      },
      {
        message: `${pendingLeaveRequests.length} pending leave requests`,
        time: new Date().toLocaleTimeString(),
        type: pendingLeaveRequests.length > 0 ? 'warning' : 'info'
      }
    ];

    const dashboardData = {
      staff: {
        name: staff.name,
        role: staff.role,
        department: staff.department
      },
      stats,
      coordinatedClasses,
      students: students.slice(0, 10), // Show first 10 students
      parents: parents.slice(0, 10), // Show first 10 parents
      todayEvents,
      upcomingEvents,
      pendingLeaveRequests: pendingLeaveRequests.slice(0, 5), // Show first 5 pending requests
      recentActivities,
      notifications
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching staff dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get students in coordinated classes
exports.getCoordinatedStudents = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    
    // Validate staffId
    if (!staffId || staffId === 'undefined' || staffId === 'null') {
      return res.status(400).json({ message: 'Invalid staff ID provided' });
    }
    
    console.log(staffId);
    
    const staff = await Staff.findById(staffId)
      .populate('coordinator', '_id name grade section')
      .select('-password');
   
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const coordinatedClasses = staff.coordinator || [];
    
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
    }).select('-password');

    res.json(students);
  } catch (error) {
    console.error('Error fetching coordinated students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get parents of coordinated students
exports.getCoordinatedParents = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    
    // Validate staffId
    if (!staffId || staffId === 'undefined' || staffId === 'null') {
      return res.status(400).json({ message: 'Invalid staff ID provided' });
    }
    
    const staff = await Staff.findById(staffId)
      .populate('coordinator', '_id name grade section')
      .select('-password');
   
    console.log(staff);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const coordinatedClasses = staff.coordinator || [];
    
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
    }).select('rollNumber');

    const studentRollNumbers = students.map(student => student.rollNumber);
    
    const parents = await Parent.find({
      childRollNumbers: { $in: studentRollNumbers }
    }).select('-password');

    res.json(parents);
  } catch (error) {
    console.error('Error fetching coordinated parents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get coordinated classes details
exports.getCoordinatedClasses = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    
    // Validate staffId
    if (!staffId || staffId === 'undefined' || staffId === 'null') {
      return res.status(400).json({ message: 'Invalid staff ID provided' });
    }
    
    const staff = await Staff.findById(staffId)
      .populate('coordinator', '_id name grade section capacity description')
      .select('-password');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const coordinatedClasses = staff.coordinator || [];
    
    // Get student count for each class
    const classesWithStudentCount = await Promise.all(
      coordinatedClasses.map(async (cls) => {
        const studentCount = await Student.countDocuments({
          $or: [
            { class: cls.name },
            {
              $and: [
                { class: cls.grade },
                { section: cls.section }
              ]
            }
          ],
          status: 'Active'
        });
        
        return {
          ...cls.toObject(),
          studentCount
        };
      })
    );

    res.json(classesWithStudentCount);
  } catch (error) {
    console.error('Error fetching coordinated classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get staff profile
exports.getStaffProfile = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    
    // Validate staffId
    if (!staffId || staffId === 'undefined' || staffId === 'null') {
      return res.status(400).json({ message: 'Invalid staff ID provided' });
    }
    
    const staff = await Staff.findById(staffId)
      .populate('department', '_id name description')
      .populate('coordinator', '_id name grade section')
      .select('-password');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update staff profile
exports.updateStaffProfile = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    
    // Validate staffId
    if (!staffId || staffId === 'undefined' || staffId === 'null') {
      return res.status(400).json({ message: 'Invalid staff ID provided' });
    }
    
    const { name, email, contactNumber, address, bio } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (address) updateData.address = address;
    if (bio) updateData.bio = bio;

    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('department', '_id name description')
    .populate('coordinator', '_id name grade section')
    .select('-password');

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Profile updated successfully', staff: updatedStaff });
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leave requests for coordinated students
exports.getLeaveRequests = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    console.log('getLeaveRequests: Called with staffId:', staffId);
    
    // Validate staffId
    if (!staffId || staffId === 'undefined' || staffId === 'null') {
      console.log('getLeaveRequests: Invalid staffId provided');
      return res.status(400).json({ message: 'Invalid staff ID provided' });
    }
    
    const staff = await Staff.findById(staffId)
      .populate('coordinator', 'name grade section')
      .select('-password');
    
    console.log('getLeaveRequests: Found staff:', staff?.name);
    console.log('getLeaveRequests: Staff coordinator:', staff?.coordinator);
    
    if (!staff) {
      console.log('getLeaveRequests: Staff not found');
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Get coordinated classes
    const coordinatedClasses = staff.coordinator || [];
    console.log('getLeaveRequests: Coordinated classes:', coordinatedClasses);
    
    if (coordinatedClasses.length === 0) {
      console.log('getLeaveRequests: No coordinated classes found');
      return res.json([]);
    }

    // Extract class and section combinations from coordinated classes
    const classSectionCombinations = coordinatedClasses.map(cls => ({
      class: cls.grade,
      section: cls.section
    }));
    
    console.log('getLeaveRequests: Looking for students in:', classSectionCombinations);

    // Find students in coordinated classes
    const students = await Student.find({
      $or: classSectionCombinations.map(combo => ({
        class: combo.class,
        section: combo.section
      }))
    }).select('_id name rollNumber class section');

    console.log('getLeaveRequests: Found students:', students.length);
    students.forEach(student => {
      console.log(`- ${student.name} (${student.class}${student.section})`);
    });

    const studentIds = students.map(student => student._id);
    
    if (studentIds.length === 0) {
      console.log('getLeaveRequests: No students found in coordinated classes');
      return res.json([]);
    }

    // Get leave requests for these students
    const leaveRequests = await StudentLeaveRequest.find({
      studentId: { $in: studentIds }
    })
    .populate('studentId', 'name rollNumber class section')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

    // Map type to leaveType if leaveType is missing
    const mappedLeaveRequests = leaveRequests.map(req => {
      // If leaveType is missing but type exists, add leaveType
      if (!req.leaveType && req.type) {
        req = req.toObject();
        req.leaveType = req.type;
      }
      return req;
    });

    res.json(mappedLeaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve/Reject leave request
exports.updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const staffId = req.params.staffId;

    const leaveRequest = await StudentLeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Verify that the staff is coordinating the student's class
    const staff = await Staff.findById(staffId)
      .populate('coordinator', '_id name grade section')
      .select('-password');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const coordinatedClasses = staff.coordinator || [];
    const student = await Student.findById(leaveRequest.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student is in coordinated classes
    const isCoordinated = coordinatedClasses.some(cls => 
      cls.name === student.class || 
      (cls.grade === student.class && cls.section === student.section)
    );

    if (!isCoordinated) {
      return res.status(403).json({ message: 'You are not authorized to approve this leave request' });
    }

    // Update leave request
    leaveRequest.status = status;
    leaveRequest.reviewedBy = staffId;
    leaveRequest.reviewedAt = new Date();
    if (comments) {
      leaveRequest.comments = comments;
    }

    await leaveRequest.save();

    res.json({ 
      message: `Leave request ${status.toLowerCase()} successfully`, 
      leaveRequest 
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get published exams for staff
exports.getPublishedExams = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const { grade, subject } = req.query;
    
    // Validate staffId
    if (!staffId || staffId === 'undefined' || staffId === 'null') {
      return res.status(400).json({ message: 'Invalid staff ID provided' });
    }
    
    console.log('Fetching published exams for staff:', staffId);
    console.log('Filters - Grade:', grade, 'Subject:', subject);
    
    // Build filter object for published exams
    const filter = { 
      status: { $in: ['Approved', 'Published'] }
    };
    
    // Add grade filter if provided
    if (grade && grade !== 'all') {
      filter.class = grade;
    }
    
    // Add subject filter if provided
    if (subject && subject !== 'all') {
      filter.subject = subject;
    }
    
    console.log('Exam filter:', filter);
    
    // Get published exams
    const exams = await ExamPaper.find(filter)
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .sort({ examDate: 1 });
    
    console.log(`Found ${exams.length} published exams`);
    
    // Transform the data to match frontend expectations
    const transformedExams = exams.map(exam => ({
      _id: exam._id,
      id: exam._id,
      subject: exam.subject,
      class: exam.class,
      grade: exam.class,
      section: exam.section,
      examType: exam.examType,
      type: exam.examType,
      examDate: exam.examDate,
      date: exam.examDate,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      instructions: exam.instructions,
      departmentId: exam.departmentId,
      status: exam.status,
      createdBy: exam.createdBy,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt
    }));
    
    console.log('Sending transformed exams:', transformedExams.length);
    res.json(transformedExams);
  } catch (error) {
    console.error('Error fetching published exams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student attendance percentage
exports.getStudentAttendancePercentage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const staffId = req.params.staffId;
    
    // Validate staffId
    if (!staffId || staffId === 'undefined' || staffId === 'null') {
      return res.status(400).json({ message: 'Invalid staff ID provided' });
    }
    
    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Verify staff is coordinator of student's class
    const staff = await Staff.findById(staffId)
      .populate('coordinator', '_id name grade section')
      .select('-password');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const coordinatedClasses = staff.coordinator || [];
    const isCoordinated = coordinatedClasses.some(cls => 
      cls.name === student.class || 
      (cls.grade === student.class && cls.section === student.section)
    );

    if (!isCoordinated) {
      return res.status(403).json({ message: 'You are not authorized to view this student\'s attendance' });
    }
    
    // Get attendance records for this student
    const Attendance = require('../../models/Staff/Teacher/attendance.model');
    const attendanceRecords = await Attendance.find({
      'attendanceData.studentRollNumber': student.rollNumber
    }).sort({ date: -1 });
    
    // Calculate attendance statistics
    let totalDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let leaveDays = 0;
    
    attendanceRecords.forEach(record => {
      const studentData = record.attendanceData.find(
        data => data.studentRollNumber === student.rollNumber
      );
      
      if (studentData) {
        totalDays++;
        switch (studentData.status) {
          case 'Present':
            presentDays++;
            break;
          case 'Absent':
            absentDays++;
            break;
          case 'Late':
            lateDays++;
            break;
          case 'Leave':
            leaveDays++;
            break;
        }
      }
    });
    
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    res.json({
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      attendanceStats: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        attendancePercentage
      }
    });
  } catch (error) {
    console.error('Error fetching student attendance percentage:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

 