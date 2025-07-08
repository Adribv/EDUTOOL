const MCQAssignment = require('../../../models/Staff/Teacher/mcqAssignment.model');
const MCQSubmission = require('../../../models/Staff/Teacher/mcqSubmission.model');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');

// Create MCQ assignment
exports.createMCQAssignment = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      class: cls, 
      section, 
      subject, 
      dueDate, 
      instructions, 
      maxMarks,
      questions,
      timeLimit,
      allowReview,
      showResults,
      randomizeQuestions,
      randomizeOptions
    } = req.body;
    
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

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || question.question.trim() === '') {
        return res.status(400).json({ message: `Question ${i + 1} cannot be empty` });
      }
      if (!question.options || question.options.length < 2) {
        return res.status(400).json({ message: `Question ${i + 1} must have at least 2 options` });
      }
      const correctOptions = question.options.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        return res.status(400).json({ message: `Question ${i + 1} must have at least one correct answer` });
      }
    }
    
    const mcqAssignment = new MCQAssignment({
      title,
      description,
      class: cls,
      section,
      subject,
      dueDate,
      instructions,
      maxMarks: maxMarks || 100,
      questions,
      timeLimit: timeLimit || 0,
      allowReview: allowReview !== undefined ? allowReview : true,
      showResults: showResults !== undefined ? showResults : true,
      randomizeQuestions: randomizeQuestions || false,
      randomizeOptions: randomizeOptions || false,
      createdBy: req.user.id
    });
    
    await mcqAssignment.save();
    
    // Populate the created assignment with teacher info
    const populatedAssignment = await MCQAssignment.findById(mcqAssignment._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      message: 'MCQ Assignment created successfully',
      assignment: populatedAssignment
    });
  } catch (error) {
    console.error('Error creating MCQ assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get MCQ assignments created by teacher
exports.getMCQAssignments = async (req, res) => {
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
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const assignments = await MCQAssignment.find(filter)
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
      const submissionsCount = await MCQSubmission.countDocuments({
        assignmentId: assignment._id,
        status: { $in: ['Submitted', 'Graded'] }
      });
      
      // Get graded submissions count
      const gradedCount = await MCQSubmission.countDocuments({
        assignmentId: assignment._id,
        status: 'Graded'
      });
      
      // Calculate average score
      const submissions = await MCQSubmission.find({
        assignmentId: assignment._id,
        status: { $in: ['Submitted', 'Graded'] }
      });
      
      const averageScore = submissions.length > 0 
        ? submissions.reduce((sum, sub) => sum + sub.percentage, 0) / submissions.length 
        : 0;
      
      // Calculate status
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      let assignmentStatus = assignment.status;
      
      if (assignment.status === 'Active' && now > dueDate) {
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
          gradingRate: submissionsCount > 0 ? Math.round((gradedCount / submissionsCount) * 100) : 0,
          averageScore: Math.round(averageScore)
        },
        status: assignmentStatus,
        isOverdue: now > dueDate,
        daysUntilDue: Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      };
    }));
    
    res.json(assignmentsWithStats);
  } catch (error) {
    console.error('Error fetching MCQ assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get MCQ assignment details
exports.getMCQAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await MCQAssignment.findById(assignmentId)
      .populate('createdBy', 'name email');
      
    if (!assignment) {
      return res.status(404).json({ message: 'MCQ Assignment not found' });
    }
    
    if (assignment.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this assignment' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching MCQ assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update MCQ assignment
exports.updateMCQAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updateData = req.body;
    
    const assignment = await MCQAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'MCQ Assignment not found' });
    }
    
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this assignment' });
    }
    
    // Don't allow updates if students have already started the assignment
    const existingSubmissions = await MCQSubmission.countDocuments({ assignmentId });
    if (existingSubmissions > 0) {
      return res.status(400).json({ message: 'Cannot update assignment as students have already started taking it' });
    }
    
    // Validate questions if provided
    if (updateData.questions) {
      if (updateData.questions.length === 0) {
        return res.status(400).json({ message: 'At least one question is required' });
      }
      
      for (let i = 0; i < updateData.questions.length; i++) {
        const question = updateData.questions[i];
        if (!question.question || question.question.trim() === '') {
          return res.status(400).json({ message: `Question ${i + 1} cannot be empty` });
        }
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ message: `Question ${i + 1} must have at least 2 options` });
        }
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length === 0) {
          return res.status(400).json({ message: `Question ${i + 1} must have at least one correct answer` });
        }
      }
    }
    
    const updatedAssignment = await MCQAssignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email');
    
    res.json({
      message: 'MCQ Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Error updating MCQ assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete MCQ assignment
exports.deleteMCQAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await MCQAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'MCQ Assignment not found' });
    }
    
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this assignment' });
    }
    
    // Check if any students have submitted
    const submissionCount = await MCQSubmission.countDocuments({ assignmentId });
    if (submissionCount > 0) {
      return res.status(400).json({ message: 'Cannot delete assignment as students have already submitted responses' });
    }
    
    await MCQAssignment.findByIdAndDelete(assignmentId);
    
    res.json({ message: 'MCQ Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting MCQ assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get MCQ submissions for an assignment
exports.getMCQSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    // Check if teacher created this assignment
    const assignment = await MCQAssignment.findById(assignmentId)
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
    const submissions = await MCQSubmission.find({ assignmentId })
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
        score: submission ? submission.totalScore : null,
        percentage: submission ? submission.percentage : null,
        timeTaken: submission ? submission.timeTaken : null,
        submissionId: submission ? submission._id : null,
        isLate,
        daysLate: isLate ? Math.ceil((submission.submittedAt - dueDate) / (1000 * 60 * 60 * 24)) : 0
      };
    });
    
    // Calculate statistics
    const stats = {
      totalStudents: students.length,
      submittedCount: result.filter(r => r.submitted).length,
      pendingCount: result.filter(r => !r.submitted).length,
      averageScore: result.filter(r => r.submitted && r.percentage !== null)
        .reduce((sum, r) => sum + r.percentage, 0) / result.filter(r => r.submitted && r.percentage !== null).length || 0,
      highestScore: Math.max(...result.filter(r => r.submitted && r.percentage !== null).map(r => r.percentage), 0),
      lowestScore: Math.min(...result.filter(r => r.submitted && r.percentage !== null).map(r => r.percentage), 100)
    };
    
    res.json({
      assignment,
      submissions: result,
      stats
    });
  } catch (error) {
    console.error('Error fetching MCQ submissions:', error);
    res.status(500).json({ message: error.message });
  }
}; 