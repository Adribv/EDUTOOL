const Student = require('../../models/Student/studentModel');
const Timetable = require('../../models/Academic/timetableModel');
const Assignment = require('../../models/Staff/Teacher/assignment.model');
const Submission = require('../../models/Staff/Teacher/submission.model');

// Get student timetable
exports.getTimetable = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    console.log(`🔍 Looking for timetable for student: ${student.name}`);
    console.log(`   Student class: "${student.class}", section: "${student.section}"`);
    
    // Try to find timetable with flexible matching for class/section formats
    let timetable = await Timetable.findOne({
      class: student.class,
      section: student.section,
      isActive: true
    }).populate('createdBy', 'name');
    
    if (timetable) {
      console.log(`   ✅ EXACT MATCH: Found timetable for class "${timetable.class}", section "${timetable.section}"`);
    } else {
      console.log(`   ❌ NO EXACT MATCH`);
      
      // If no exact match, try case-insensitive matching
      timetable = await Timetable.findOne({
        class: { $regex: new RegExp(`^${student.class}$`, 'i') },
        section: { $regex: new RegExp(`^${student.section}$`, 'i') },
        isActive: true
      }).populate('createdBy', 'name');
      
      if (timetable) {
        console.log(`   ✅ CASE-INSENSITIVE MATCH: Found timetable for class "${timetable.class}", section "${timetable.section}"`);
      } else {
        console.log(`   ❌ NO CASE-INSENSITIVE MATCH`);
        
        // If still no match, try to normalize and match common formats
        const normalizedStudentClass = student.class.toString().replace(/\s+/g, '').toUpperCase();
        const normalizedStudentSection = student.section.toString().replace(/\s+/g, '').toUpperCase();
        
        console.log(`   🔧 Normalized student class: "${normalizedStudentClass}", section: "${normalizedStudentSection}"`);
        
        // Find all active timetables
        const allTimetables = await Timetable.find({ isActive: true }).populate('createdBy', 'name');
        
        console.log(`   📅 Found ${allTimetables.length} active timetables to check`);
        
        // Try to find a match with normalized values
        for (const t of allTimetables) {
          const normalizedTimetableClass = t.class.toString().replace(/\s+/g, '').toUpperCase();
          const normalizedTimetableSection = t.section.toString().replace(/\s+/g, '').toUpperCase();
          
          console.log(`   🔍 Checking timetable: class "${t.class}" -> "${normalizedTimetableClass}", section "${t.section}" -> "${normalizedTimetableSection}"`);
          
          if (normalizedTimetableClass === normalizedStudentClass && 
              normalizedTimetableSection === normalizedStudentSection) {
            timetable = t;
            console.log(`   ✅ NORMALIZED MATCH: Found timetable for class "${timetable.class}", section "${timetable.section}"`);
            break;
          }
        }
        
        if (!timetable) {
          console.log(`   ❌ NO NORMALIZED MATCH`);
          
          // Try flexible matching for combined class+section formats
          for (const t of allTimetables) {
            const timetableClassStr = String(t.class);
            const timetableSectionStr = String(t.section);
            const studentClassStr = String(student.class);
            const studentSectionStr = String(student.section);
            
            // Check if student class includes section (e.g., student has "12C" but timetable has "12" + "C")
            if (studentClassStr.includes(studentSectionStr) && 
                timetableClassStr === studentClassStr.replace(studentSectionStr, '') &&
                timetableSectionStr === studentSectionStr) {
              timetable = t;
              console.log(`   ✅ FLEXIBLE MATCH 1: Student "${studentClassStr}" matches timetable "${timetableClassStr}" + "${timetableSectionStr}"`);
              break;
            }
            
            // Check if timetable class includes section (e.g., timetable has "12C" but student has "12" + "C")
            if (timetableClassStr.includes(timetableSectionStr) &&
                studentClassStr === timetableClassStr.replace(timetableSectionStr, '') &&
                studentSectionStr === timetableSectionStr) {
              timetable = t;
              console.log(`   ✅ FLEXIBLE MATCH 2: Timetable "${timetableClassStr}" matches student "${studentClassStr}" + "${studentSectionStr}"`);
              break;
            }
          }
          
          if (!timetable) {
            console.log(`   ❌ NO FLEXIBLE MATCH`);
          }
        }
      }
    }
    
    if (!timetable) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Transform timetable data to match frontend expectations
    const transformedTimetable = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    days.forEach(day => {
      if (timetable[day] && timetable[day].periods) {
        timetable[day].periods.forEach(period => {
          transformedTimetable.push({
            id: `${timetable._id}-${day}-${period._id}`,
            day: day.charAt(0).toUpperCase() + day.slice(1),
            time: `${period.startTime} - ${period.endTime}`,
            subject: period.subject,
            teacher: period.teacher,
            teacherName: period.teacher ? 'Teacher' : 'TBD', // Will be populated if teacher reference exists
            room: period.room || 'TBD',
            class: timetable.class,
            section: timetable.section
          });
        });
      }
    });
    
    // If teacher references exist, populate teacher names
    const teacherIds = [...new Set(transformedTimetable.map(t => t.teacher).filter(Boolean))];
    if (teacherIds.length > 0) {
      const Staff = require('../../models/Staff/staffModel');
      const teachers = await Staff.find({ _id: { $in: teacherIds } }).select('name');
      const teacherMap = new Map(teachers.map(t => [t._id.toString(), t.name]));
      
      transformedTimetable.forEach(entry => {
        if (entry.teacher) {
          entry.teacherName = teacherMap.get(entry.teacher.toString()) || 'Teacher';
        }
      });
    }
    
    res.json({
      success: true,
      data: transformedTimetable
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get assigned subjects and teachers
exports.getSubjectsAndTeachers = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get subjects from timetable for this class and section
    const timetable = await Timetable.findOne({
      class: student.class,
      section: student.section
    });
    
    let subjects = [];
    
    if (timetable && timetable.schedule) {
      // Extract unique subjects from timetable
      const subjectMap = new Map();
      
      timetable.schedule.forEach(day => {
        day.periods.forEach(period => {
          if (period.subject && period.teacher) {
            subjectMap.set(period.subject, {
              name: period.subject,
              teacher: period.teacher,
              subjectCode: period.subjectCode || period.subject
            });
          }
        });
      });
      
      subjects = Array.from(subjectMap.values());
    }
    
    // If no subjects found in timetable, return empty array
    res.json({
      class: student.class,
      section: student.section,
      subjects: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects and teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Alias for getSubjectsAndTeachers to maintain compatibility
exports.getSubjects = exports.getSubjectsAndTeachers;

// Get assignments
exports.getAssignments = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const assignments = await Assignment.find({
      class: student.class,
      section: student.section,
      status: { $in: ['Active', 'Completed'] }
    })
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1 });
    
    // Get submission status for each assignment
    const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: student._id
      });
      
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      const isOverdue = now > dueDate;
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : 'Not Submitted',
        submissionId: submission ? submission._id : null,
        hasSubmitted: !!submission,
        grade: submission ? submission.grade : null,
        feedback: submission ? submission.feedback : null,
        submittedAt: submission ? submission.submittedAt : null,
        isLate: submission ? submission.isLate : false,
        isOverdue,
        daysUntilDue,
        canSubmit: !isOverdue || assignment.allowLateSubmission
      };
    }));
    
    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content } = req.body;
    
    // Check if assignment exists and is valid for this student
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    const student = await Student.findById(req.user.id);
    if (assignment.class !== student.class || assignment.section !== student.section) {
      return res.status(403).json({ message: 'This assignment is not for your class' });
    }
    
    // Check if assignment is still active
    if (assignment.status !== 'Active') {
      return res.status(400).json({ message: 'Assignment is no longer accepting submissions' });
    }
    
    // Check if due date has passed and late submission is not allowed
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;
    
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ message: 'Assignment submission deadline has passed and late submissions are not allowed' });
    }
    
    // Check if already submitted
    let submission = await Submission.findOne({
      assignmentId,
      studentId: student._id
    });
    
    // Handle file upload if any
    let fileUrl = null;
    let attachments = [];
    
    if (req.file) {
      fileUrl = `/uploads/assignments/${req.file.filename}`;
      attachments.push({
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      });
    }
    
    if (submission) {
      // Update existing submission
      submission.content = content || submission.content;
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.attachments = attachments.length > 0 ? attachments : submission.attachments;
      submission.submittedAt = new Date();
      submission.status = isLate ? 'Late' : 'Submitted';
      submission.isLate = isLate;
      submission.version += 1;
    } else {
      // Create new submission
      submission = new Submission({
        assignmentId,
        studentId: student._id,
        content: content || '',
        fileUrl: fileUrl || '',
        attachments,
        status: isLate ? 'Late' : 'Submitted',
        isLate
      });
    }
    
    await submission.save();
    
    res.status(201).json({ 
      message: 'Assignment submitted successfully', 
      submission: {
        _id: submission._id,
        status: submission.status,
        submittedAt: submission.submittedAt,
        isLate: submission.isLate
      }
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assignment details for student
exports.getAssignmentDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if assignment is for this student's class
    if (assignment.class !== student.class || assignment.section !== student.section) {
      return res.status(403).json({ message: 'This assignment is not for your class' });
    }
    
    // Get student's submission if exists
    const submission = await Submission.findOne({
      assignmentId: assignment._id,
      studentId: student._id
    });
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    res.json({
      assignment,
      submission,
      hasSubmitted: !!submission,
      isOverdue,
      daysUntilDue,
      canSubmit: !isOverdue || assignment.allowLateSubmission
    });
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get submission feedback
exports.getSubmissionFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await Submission.findById(submissionId)
      .populate('assignmentId', 'title subject maxMarks')
      .populate('gradedBy', 'name email');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if submission belongs to the current student
    if (submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this submission' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove placeholder methods - these are handled by other controllers
// exports.getAttendance = async (req, res) => {
//   // This is handled by attendanceController.js
// };

// exports.submitLeaveRequest = async (req, res) => {
//   // This is handled by attendanceController.js
// };

// exports.getLeaveRequests = async (req, res) => {
//   // This is handled by attendanceController.js
// };

// exports.getExams = async (req, res) => {
//   // This is handled by examinationController.js
// };

// exports.getAdmitCard = async (req, res) => {
//   // This is handled by examinationController.js
// };

// exports.getExamResults = async (req, res) => {
//   // This is handled by examinationController.js
// };

// exports.getReportCards = async (req, res) => {
//   // This is handled by examinationController.js
// };

// exports.getPerformanceAnalytics = async (req, res) => {
//   // This is handled by examinationController.js
// };

// exports.getResources = async (req, res) => {
//   // This is handled by learningResourcesController.js
// };

// exports.getResourceDetails = async (req, res) => {
//   // This is handled by learningResourcesController.js
// };