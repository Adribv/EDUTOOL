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
      return res.status(404).json({ message: 'Timetable not found for your class' });
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

// Get assignments
exports.getAssignments = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const assignments = await Assignment.find({
      class: student.class,
      section: student.section
    }).sort({ dueDate: 1 });
    
    // Get submission status for each assignment
    const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: student._id
      });
      
      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : 'Not Submitted',
        submissionId: submission ? submission._id : null
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
    
    // Check if already submitted
    let submission = await Submission.findOne({
      assignmentId,
      studentId: student._id
    });
    
    if (submission) {
      // Update existing submission
      submission.content = content;
      submission.submittedAt = new Date();
      submission.status = 'Submitted';
    } else {
      // Create new submission
      submission = new Submission({
        assignmentId,
        studentId: student._id,
        content,
        status: 'Submitted'
      });
    }
    
    await submission.save();
    res.status(201).json({ message: 'Assignment submitted successfully', submission });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get submission feedback
exports.getSubmissionFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Verify this submission belongs to the student
    if (submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};