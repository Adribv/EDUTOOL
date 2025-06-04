const Assignment = require('../../../models/Staff/Teacher/assignment.model');
const Submission = require('../../../models/Staff/Teacher/submission.model');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, class: cls, section, subject, dueDate } = req.body;
    
    // Check if teacher is assigned to this class and subject
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class/subject' });
    }
    
    const assignment = new Assignment({
      title,
      description,
      class: cls,
      section,
      subject,
      dueDate,
      createdBy: req.user.id
    });
    
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments created by teacher
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user.id });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get submissions for an assignment
exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    // Check if teacher created this assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this assignment' });
    }
    
    // Get all students in the class
    const students = await Student.find({ 
      class: assignment.class, 
      section: assignment.section 
    });
    
    // Get submissions for this assignment
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name rollNumber');
    
    // Combine student info with submission status
    const result = students.map(student => {
      const submission = submissions.find(sub => 
        sub.studentId._id.toString() === student._id.toString()
      );
      
      return {
        studentName: student.name,
        rollNumber: student.rollNumber,
        studentId: student._id,
        submitted: !!submission,
        submissionDate: submission ? submission.submissionDate : null,
        status: submission ? submission.status : 'Not Submitted',
        grade: submission ? submission.grade : null,
        feedback: submission ? submission.feedback : null
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grade submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    
    const submission = await Submission.findById(submissionId)
      .populate('assignmentId');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if teacher created the assignment
    if (submission.assignmentId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to grade this submission' });
    }
    
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'Graded';
    
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};