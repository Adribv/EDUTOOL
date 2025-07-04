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
    
    const timetable = await Timetable.findOne({
      class: student.class,
      section: student.section
    });
    
    if (!timetable) {
      return res.json([]);
    }
    
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error' });
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