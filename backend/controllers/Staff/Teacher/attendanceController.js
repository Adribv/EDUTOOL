const Attendance = require('../../../models/Staff/Teacher/attendance.model');
const Student = require('../../../models/Student/studentModel');
const Staff = require('../../../models/Staff/staffModel');

// Mark attendance for a class
exports.markAttendance = async (req, res) => {
  try {
    const { date, class: cls, section, attendanceData } = req.body;
    
    // Check if teacher is assigned to this class
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }
    
    // attendanceData is an array of { studentRollNumber, status }
    const attendanceRecords = attendanceData.map(record => ({
      studentRollNumber: record.studentRollNumber,
      date,
      status: record.status,
      markedBy: req.user.id
    }));
    
    // Remove any existing attendance records for this class, date
    await Attendance.deleteMany({
      date,
      studentRollNumber: { $in: attendanceData.map(record => record.studentRollNumber) }
    });
    
    // Insert new attendance records
    const result = await Attendance.insertMany(attendanceRecords);
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance for a class
exports.getAttendance = async (req, res) => {
  try {
    const { class: cls, section, date } = req.params;
    
    // Check if teacher is assigned to this class
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }
    
    // Get students in this class
    const students = await Student.find({ class: cls, section }, 'name rollNumber');
    
    // Get attendance records for this date
    const attendanceRecords = await Attendance.find({
      date,
      studentRollNumber: { $in: students.map(student => student.rollNumber) }
    });
    
    // Combine student info with attendance status
    const result = students.map(student => {
      const record = attendanceRecords.find(record => record.studentRollNumber === student.rollNumber);
      return {
        name: student.name,
        rollNumber: student.rollNumber,
        status: record ? record.status : 'Not Marked'
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate attendance report
exports.generateAttendanceReport = async (req, res) => {
  try {
    const { class: cls, section, startDate, endDate } = req.params;
    
    // Check if teacher is assigned to this class
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }
    
    // Get students in this class
    const students = await Student.find({ class: cls, section }, 'name rollNumber');
    
    // Get attendance records for this date range
    const attendanceRecords = await Attendance.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      studentRollNumber: { $in: students.map(student => student.rollNumber) }
    });
    
    // Calculate attendance statistics for each student
    const report = students.map(student => {
      const studentRecords = attendanceRecords.filter(record => 
        record.studentRollNumber === student.rollNumber
      );
      
      const totalDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
      const presentDays = studentRecords.filter(record => record.status === 'Present').length;
      const absentDays = studentRecords.filter(record => record.status === 'Absent').length;
      const leaveDays = studentRecords.filter(record => record.status === 'Leave').length;
      
      return {
        name: student.name,
        rollNumber: student.rollNumber,
        presentDays,
        absentDays,
        leaveDays,
        attendancePercentage: (presentDays / totalDays) * 100
      };
    });
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};