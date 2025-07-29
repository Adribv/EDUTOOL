const Assignment = require('../../../models/Staff/Teacher/assignment.model');
const Submission = require('../../../models/Staff/Teacher/submission.model');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, class: cls, section, subject, dueDate, instructions, maxMarks, attachments } = req.body;
    
    // Get staff details with coordinated classes
    const staff = await Staff.findById(req.user.id)
      .populate('coordinator', '_id name grade section')
      .select('-password');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const coordinatedClasses = staff.coordinator || [];
    
    // Check if teacher coordinates this class
    const isCoordinator = coordinatedClasses.some(
      coordClass => (
        coordClass.name === cls || 
        (coordClass.grade === cls && coordClass.section === section)
      )
    );
    
    // Also check if teacher is assigned to this class/subject (fallback)
    const isAssigned = staff.assignedSubjects && staff.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    if (!isCoordinator && !isAssigned) {
      return res.status(403).json({ 
        message: 'You are not authorized to create assignments for this class. You must be either a coordinator or assigned to this class/subject.' 
      });
    }
    
    const assignment = new Assignment({
      title,
      description,
      class: cls,
      section,
      subject,
      dueDate,
      instructions,
      maxMarks: maxMarks || 100,
      attachments: attachments || [],
      createdBy: req.user.id
    });
    
    await assignment.save();
    
    // Populate the created assignment with teacher info
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: populatedAssignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get assignments created by teacher
exports.getAssignments = async (req, res) => {
  try {
    const { class: classFilter, subject: subjectFilter, status } = req.query;
    
    // Build filter object
    const filter = { createdBy: req.user.id };
    
    if (classFilter && classFilter !== 'all') {
      filter.class = classFilter;
    }
    
    if (subjectFilter && subjectFilter !== 'all') {
      filter.subject = subjectFilter;
    }
    
    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Get submission statistics for each assignment
    const assignmentsWithStats = await Promise.all(assignments.map(async (assignment) => {
      // Get all students in the class
      const totalStudents = await Student.countDocuments({
        class: assignment.class,
        section: assignment.section,
        status: 'Active'
      });
      
      // Get submissions count
      const submissionsCount = await Submission.countDocuments({
        assignmentId: assignment._id
      });
      
      // Get graded submissions count
      const gradedCount = await Submission.countDocuments({
        assignmentId: assignment._id,
        status: 'Graded'
      });
      
      // Calculate status
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      let assignmentStatus = 'Active';
      
      if (now > dueDate) {
        assignmentStatus = submissionsCount === totalStudents ? 'Completed' : 'Overdue';
      }
      
      return {
        ...assignment.toObject(),
        stats: {
          totalStudents,
          submissionsCount,
          gradedCount,
          pendingSubmissions: totalStudents - submissionsCount,
          submissionRate: totalStudents > 0 ? Math.round((submissionsCount / totalStudents) * 100) : 0,
          gradingRate: submissionsCount > 0 ? Math.round((gradedCount / submissionsCount) * 100) : 0
        },
        status: assignmentStatus,
        isOverdue: now > dueDate,
        daysUntilDue: Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      };
    }));
    
    res.json(assignmentsWithStats);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get submissions for an assignment
exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    // Check if teacher created this assignment
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email');
      
    if (!assignment || assignment.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this assignment' });
    }
    
    // Get all students in the class
    const students = await Student.find({ 
      class: assignment.class, 
      section: assignment.section,
      status: 'Active'
    }).select('name rollNumber email contactNumber').sort({ rollNumber: 1 });
    
    // Get submissions for this assignment
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name rollNumber email contactNumber')
      .sort({ submittedAt: -1 });
    
    // Combine student info with submission status
    const result = students.map(student => {
      const submission = submissions.find(sub => 
        sub.studentId._id.toString() === student._id.toString()
      );
      
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      const isLate = submission && submission.submittedAt > dueDate;
      
      return {
        studentName: student.name,
        rollNumber: student.rollNumber,
        studentId: student._id,
        email: student.email,
        contactNumber: student.contactNumber,
        submitted: !!submission,
        submissionDate: submission ? submission.submittedAt : null,
        status: submission ? submission.status : 'Not Submitted',
        grade: submission ? submission.grade : null,
        feedback: submission ? submission.feedback : null,
        submissionId: submission ? submission._id : null,
        content: submission ? submission.content : null,
        fileUrl: submission ? submission.fileUrl : null,
        isLate,
        daysLate: isLate ? Math.ceil((submission.submittedAt - dueDate) / (1000 * 60 * 60 * 24)) : 0
      };
    });
    
    // Calculate statistics
    const stats = {
      totalStudents: students.length,
      submittedCount: result.filter(r => r.submitted).length,
      pendingCount: result.filter(r => !r.submitted).length,
      gradedCount: result.filter(r => r.status === 'Graded').length,
      lateSubmissions: result.filter(r => r.isLate).length,
      submissionRate: students.length > 0 ? Math.round((result.filter(r => r.submitted).length / students.length) * 100) : 0
    };
    
    res.json({
      assignment,
      submissions: result,
      stats
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: error.message });
  }
};

// Grade submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback, maxMarks } = req.body;
    
    const submission = await Submission.findById(submissionId)
      .populate('assignmentId')
      .populate('studentId', 'name rollNumber');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if teacher created the assignment
    if (submission.assignmentId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to grade this submission' });
    }
    
    // Validate grade
    const maxScore = maxMarks || submission.assignmentId.maxMarks || 100;
    if (grade < 0 || grade > maxScore) {
      return res.status(400).json({ message: `Grade must be between 0 and ${maxScore}` });
    }
    
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'Graded';
    submission.gradedAt = new Date();
    
    await submission.save();
    
    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { title, description, dueDate, instructions, maxMarks } = req.body;
    
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment || assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to update this assignment' });
    }
    
    // Update assignment fields
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;
    if (instructions) assignment.instructions = instructions;
    if (maxMarks) assignment.maxMarks = maxMarks;
    
    await assignment.save();
    
    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment || assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to delete this assignment' });
    }
    
    // Check if there are submissions
    const submissionCount = await Submission.countDocuments({ assignmentId });
    
    if (submissionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete assignment with existing submissions. Consider archiving instead.' 
      });
    }
    
    await Assignment.findByIdAndDelete(assignmentId);
    
    res.json({
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get assignment details
exports.getAssignmentDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email');
    
    if (!assignment || assignment.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this assignment' });
    }
    
    // Get submission statistics
    const totalStudents = await Student.countDocuments({
      class: assignment.class,
      section: assignment.section,
      status: 'Active'
    });
    
    const submissionsCount = await Submission.countDocuments({
      assignmentId: assignment._id
    });
    
    const gradedCount = await Submission.countDocuments({
      assignmentId: assignment._id,
      status: 'Graded'
    });
    
    const stats = {
      totalStudents,
      submissionsCount,
      gradedCount,
      pendingSubmissions: totalStudents - submissionsCount,
      submissionRate: totalStudents > 0 ? Math.round((submissionsCount / totalStudents) * 100) : 0,
      gradingRate: submissionsCount > 0 ? Math.round((gradedCount / submissionsCount) * 100) : 0
    };
    
    res.json({
      assignment,
      stats
    });
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    res.status(500).json({ message: error.message });
  }
};