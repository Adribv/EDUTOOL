const Attendance = require('../../../models/Staff/Teacher/attendance.model');
const Student = require('../../../models/Student/studentModel');
const Staff = require('../../../models/Staff/staffModel');
const Class = require('../../../models/Admin/classModel');

// Mark attendance for a class
exports.markAttendance = async (req, res) => {
  try {
    const { date, class: cls, section, attendanceData } = req.body;
    
    // Check if teacher is coordinator of this class or assigned to this class
    const staff = await Staff.findById(req.user.id).populate('coordinator');
    
    // Check if teacher coordinates this class
    const isCoordinator = staff.coordinator && staff.coordinator.some(
      classObj => (classObj.name === cls || `${classObj.grade} ${classObj.section}` === cls)
    );
    
    // Also check if teacher is assigned to this class (fallback)
    const isAssigned = staff.assignedSubjects && staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isCoordinator && !isAssigned) {
      return res.status(403).json({ message: 'You are not authorized to mark attendance for this class' });
    }
    
    // Create attendance record with the new structure
    const attendanceRecord = {
      class: cls,
      section: section,
      date: new Date(date),
      attendanceData: attendanceData.map(record => ({
        studentRollNumber: record.studentRollNumber,
        studentName: record.studentName,
        status: record.status,
        remarks: record.remarks || ''
      })),
      markedBy: req.user.id
    };
    
    // Remove any existing attendance record for this class, section, and date
    await Attendance.deleteOne({
      class: cls,
      section: section,
      date: new Date(date)
    });
    
    // Insert new attendance record
    const result = await Attendance.create(attendanceRecord);
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      data: result
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get attendance for a class
exports.getAttendance = async (req, res) => {
  try {
    const { class: cls, section, date } = req.params;
    
    // Check if teacher is coordinator of this class or assigned to this class
    const staff = await Staff.findById(req.user.id).populate('coordinator');
    
    // Check if teacher coordinates this class
    const isCoordinator = staff.coordinator && staff.coordinator.some(
      classObj => (classObj.name === cls || `${classObj.grade} ${classObj.section}` === cls)
    );
    
    // Also check if teacher is assigned to this class (fallback)
    const isAssigned = staff.assignedSubjects && staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isCoordinator && !isAssigned) {
      return res.status(403).json({ message: 'You are not authorized to view attendance for this class' });
    }
    
    // Get attendance record for this class, section, and date
    const attendanceRecord = await Attendance.findOne({
      class: cls,
      section: section,
      date: new Date(date)
    });
    
    if (!attendanceRecord) {
      return res.json([]); // Return empty array if no attendance found
    }
    
    res.json(attendanceRecord.attendanceData);
  } catch (error) {
    console.error('Error getting attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate attendance report
exports.generateAttendanceReport = async (req, res) => {
  try {
    const { class: cls, section, startDate, endDate } = req.params;
    const { format } = req.query; // Check if CSV format is requested
    
    // Check if teacher is coordinator of this class or assigned to this class
    const staff = await Staff.findById(req.user.id).populate('coordinator');
    
    // Check if teacher coordinates this class
    const isCoordinator = staff.coordinator && staff.coordinator.some(
      classObj => (classObj.name === cls || `${classObj.grade} ${classObj.section}` === cls)
    );
    
    // Also check if teacher is assigned to this class (fallback)
    const isAssigned = staff.assignedSubjects && staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isCoordinator && !isAssigned) {
      return res.status(403).json({ message: 'You are not authorized to generate report for this class' });
    }
    
    // Get students in this class
    const students = await Student.find({ 
      class: cls, 
      section: section 
    }, 'name rollNumber');
    
    // Get attendance records for this date range
    const attendanceRecords = await Attendance.find({
      class: cls,
      section: section,
      date: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    }).sort({ date: 1 });
    
    // Calculate attendance statistics for each student
    const report = students.map(student => {
      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;
      let leaveDays = 0;
      let totalMarkedDays = 0;
      
      attendanceRecords.forEach(record => {
        const studentAttendance = record.attendanceData.find(
          data => data.studentRollNumber === student.rollNumber
        );
        
        if (studentAttendance) {
          totalMarkedDays++;
          switch (studentAttendance.status) {
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
      
      const attendancePercentage = totalMarkedDays > 0 ? (presentDays / totalMarkedDays) * 100 : 0;
      
      return {
        name: student.name,
        rollNumber: student.rollNumber,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        totalMarkedDays,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      };
    });
    
    // If CSV format is requested, return CSV data
    if (format === 'csv') {
      const csvHeader = 'Name,Roll Number,Present Days,Absent Days,Late Days,Leave Days,Total Days,Attendance %\n';
      const csvData = report.map(student => 
        `"${student.name}","${student.rollNumber}",${student.presentDays},${student.absentDays},${student.lateDays},${student.leaveDays},${student.totalMarkedDays},${student.attendancePercentage}%`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance_${cls}_${section}_${startDate}_${endDate}.csv"`);
      return res.send(csvHeader + csvData);
    }
    
    res.json({
      class: cls,
      section: section,
      startDate,
      endDate,
      totalStudents: students.length,
      report
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get students by class and section (helper function for frontend)
exports.getStudentsByClass = async (req, res) => {
  try {
    const { class: cls, section } = req.params;
    
    // Check if teacher is coordinator of this class or assigned to this class
    const staff = await Staff.findById(req.user.id).populate('coordinator');
    
    // Check if teacher coordinates this class
    const isCoordinator = staff.coordinator && staff.coordinator.some(
      classObj => (classObj.name === cls || `${classObj.grade} ${classObj.section}` === cls)
    );
    
    // Also check if teacher is assigned to this class (fallback)
    const isAssigned = staff.assignedSubjects && staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isCoordinator && !isAssigned) {
      return res.status(403).json({ message: 'You are not authorized to view students for this class' });
    }
    
    // Get students in this class
    const students = await Student.find({ 
      class: cls, 
      section: section 
    }, 'name rollNumber email contactNumber').sort({ rollNumber: 1 });
    
    res.json(students);
  } catch (error) {
    console.error('Error getting students by class:', error);
    res.status(500).json({ message: error.message });
  }
};