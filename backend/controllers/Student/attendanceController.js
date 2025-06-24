const Student = require('../../models/Student/studentModel');
const Attendance = require('../../models/Staff/Teacher/attendance.model');
const LeaveRequest = require('../../models/Student/leaveRequestModel');

// Get attendance records
exports.getAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Build query based on provided filters
    const query = {
      'attendanceData.studentRollNumber': student.rollNumber
    };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendanceRecords = await Attendance.find(query).sort({ date: -1 });
    
    // Extract this student's attendance from the records
    const studentAttendance = attendanceRecords.map(record => {
      const studentData = record.attendanceData.find(
        data => data.studentRollNumber === student.rollNumber
      );
      
      return {
        date: record.date,
        status: studentData ? studentData.status : 'Not Recorded',
        remarks: studentData ? studentData.remarks : ''
      };
    });
    
    res.json(studentAttendance);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit leave request
exports.requestLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason, type } = req.body;
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Map UI types to enum values
    const typeMap = {
      sick: 'Medical',
      personal: 'Personal',
      emergency: 'Family Emergency',
      other: 'Other',
    };
    const mappedType = typeMap[type] || type;
    
    const leaveRequest = new LeaveRequest({
      studentId: student._id,
      class: student.class,
      section: student.section,
      startDate,
      endDate,
      reason,
      type: mappedType,
      status: 'Pending'
    });
    
    await leaveRequest.save();
    res.status(201).json({ message: 'Leave request submitted successfully', leaveRequest });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leave requests
exports.getLeaveRequests = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const leaveRequests = await LeaveRequest.find({ studentId: student._id })
      .sort({ createdAt: -1 });
    
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};