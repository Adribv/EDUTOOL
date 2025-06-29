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
    
    // This would typically query a class-subject-teacher mapping model
    // For now, return a placeholder response
    res.json({
      class: student.class,
      section: student.section,
      subjects: [
        { name: 'Mathematics', teacher: 'Mr. John Smith' },
        { name: 'Science', teacher: 'Ms. Jane Doe' },
        { name: 'English', teacher: 'Mrs. Emily Johnson' }
      ]
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

// Placeholder methods for missing routes - these should be implemented based on your requirements
exports.getAttendance = async (req, res) => {
  try {
    // Placeholder implementation
    res.json({ message: 'Attendance data not implemented yet' });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitLeaveRequest = async (req, res) => {
  try {
    // Placeholder implementation
    res.json({ message: 'Leave request submission not implemented yet' });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaveRequests = async (req, res) => {
  try {
    // Placeholder implementation
    res.json([]);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExams = async (req, res) => {
  try {
    // Placeholder implementation
    res.json([]);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdmitCard = async (req, res) => {
  try {
    // Placeholder implementation
    res.json({ message: 'Admit card not implemented yet' });
  } catch (error) {
    console.error('Error fetching admit card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExamResults = async (req, res) => {
  try {
    // Placeholder implementation
    res.json([]);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportCards = async (req, res) => {
  try {
    // Placeholder implementation
    res.json([]);
  } catch (error) {
    console.error('Error fetching report cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPerformanceAnalytics = async (req, res) => {
  try {
    // Placeholder implementation
    res.json({ message: 'Performance analytics not implemented yet' });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getResources = async (req, res) => {
  try {
    // Placeholder implementation
    res.json([]);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getResourceDetails = async (req, res) => {
  try {
    // Placeholder implementation
    res.json({ message: 'Resource details not implemented yet' });
  } catch (error) {
    console.error('Error fetching resource details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};