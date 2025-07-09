const MCQAssignment = require('../../models/Staff/Teacher/mcqAssignment.model');
const MCQSubmission = require('../../models/Staff/Teacher/mcqSubmission.model');
const Student = require('../../models/Student/studentModel');

// Helper function to normalize class formats for comparison
const normalizeClass = (classValue) => {
  if (!classValue) return '';
  
  // Remove any non-alphanumeric characters and convert to string
  const cleanClass = String(classValue).replace(/[^a-zA-Z0-9]/g, '');
  
  // Extract numeric part (grade) and alphabetic part (section)
  const gradeMatch = cleanClass.match(/^(\d+)/);
  const sectionMatch = cleanClass.match(/([A-Za-z]+)$/);
  
  if (gradeMatch && sectionMatch) {
    // Format like "12C" -> grade: "12", section: "C"
    return {
      grade: gradeMatch[1],
      section: sectionMatch[1].toUpperCase(),
      fullClass: cleanClass
    };
  } else if (gradeMatch) {
    // Format like "12" -> grade: "12", section: ""
    return {
      grade: gradeMatch[1],
      section: '',
      fullClass: cleanClass
    };
  } else {
    // Fallback
    return {
      grade: cleanClass,
      section: '',
      fullClass: cleanClass
    };
  }
};

// Helper function to check if classes match (handles different formats)
const classesMatch = (studentClass, assignmentClass, studentSection, assignmentSection) => {
  const studentNormalized = normalizeClass(studentClass);
  const assignmentNormalized = normalizeClass(assignmentClass);
  
  // Direct match
  if (studentClass === assignmentClass && studentSection === assignmentSection) {
    return true;
  }
  
  // Handle cases like student: "12C" vs assignment: "12" + "C"
  if (studentNormalized.grade === assignmentNormalized.grade && 
      (studentNormalized.section === assignmentSection || 
       studentSection === assignmentNormalized.section ||
       studentNormalized.section === assignmentNormalized.section)) {
    return true;
  }
  
  // Handle cases where student class includes section (e.g., "12C") and assignment has separate class/section
  if (studentNormalized.fullClass === assignmentClass && studentSection === assignmentSection) {
    return true;
  }
  
  // Handle cases where assignment class includes section (e.g., "12C") and student has separate class/section
  if (assignmentNormalized.fullClass === studentClass && studentSection === assignmentSection) {
    return true;
  }
  
  return false;
};

// Get MCQ assignments for student
exports.getMCQAssignments = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get MCQ assignments for student's class (with flexible class matching)
    const allAssignments = await MCQAssignment.find({
      status: 'Active'
    })
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1 });

    // Filter assignments that match the student's class using flexible matching
    const assignments = allAssignments.filter(assignment => 
      classesMatch(student.class, assignment.class, student.section, assignment.section)
    );

    // Get student's submissions
    const submissions = await MCQSubmission.find({
      studentId: req.user.id
    });

    // Combine assignment info with submission status
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissions.find(sub => 
        sub.assignmentId.toString() === assignment._id.toString()
      );

      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      const isOverdue = now > dueDate;
      const canSubmit = !submission || submission.status === 'In Progress';

      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : 'Not Started',
        submitted: !!submission,
        submissionId: submission ? submission._id : null,
        score: submission ? submission.totalScore : null,
        percentage: submission ? submission.percentage : null,
        timeTaken: submission ? submission.timeTaken : null,
        isOverdue,
        canSubmit,
        daysUntilDue: Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)),
        timeLimit: assignment.timeLimit > 0 ? assignment.timeLimit : null
      };
    });

    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error('Error fetching MCQ assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get MCQ assignment details for student
exports.getMCQAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const assignment = await MCQAssignment.findById(assignmentId)
      .populate('createdBy', 'name email');
      
    if (!assignment) {
      return res.status(404).json({ message: 'MCQ Assignment not found' });
    }

    // Check if student is in the correct class (with flexible matching)
    if (!classesMatch(student.class, assignment.class, student.section, assignment.section)) {
      return res.status(403).json({ message: 'You do not have access to this assignment' });
    }

    // Get student's submission if exists
    const submission = await MCQSubmission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    // Check if assignment is still active
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;

    // Prepare assignment data for student
    let assignmentData = {
      ...assignment.toObject(),
      submissionStatus: submission ? submission.status : 'Not Started',
      submitted: !!submission,
      submissionId: submission ? submission._id : null,
      isOverdue,
      canSubmit: !submission || submission.status === 'In Progress'
    };

    // If student has already submitted, show results if allowed
    if (submission && submission.status === 'Submitted' && assignment.showResults) {
      assignmentData.score = submission.totalScore;
      assignmentData.percentage = submission.percentage;
      assignmentData.timeTaken = submission.timeTaken;
      assignmentData.submittedAt = submission.submittedAt;
    }

    // If student hasn't started, prepare questions for taking the test
    if (!submission || submission.status === 'In Progress') {
      // Randomize questions if enabled
      let questions = [...assignment.questions];
      if (assignment.randomizeQuestions) {
        questions = questions.sort(() => Math.random() - 0.5);
      }

      // Randomize options if enabled
      if (assignment.randomizeOptions) {
        questions = questions.map(q => ({
          ...q,
          options: q.options.sort(() => Math.random() - 0.5)
        }));
      }

      // Remove correct answer indicators for student view
      questions = questions.map(q => ({
        ...q,
        options: q.options.map(opt => ({
          text: opt.text,
          // Don't include isCorrect for student view
        }))
      }));

      assignmentData.questions = questions;
    }

    res.json(assignmentData);
  } catch (error) {
    console.error('Error fetching MCQ assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Start MCQ assignment
exports.startMCQAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    console.log('Starting MCQ assignment for student:', req.user.id, 'assignment:', assignmentId);
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      console.log('Student not found:', req.user.id);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Student found:', student.name, 'Class:', student.class, 'Section:', student.section);

    const assignment = await MCQAssignment.findById(assignmentId);
    if (!assignment) {
      console.log('MCQ Assignment not found:', assignmentId);
      return res.status(404).json({ message: 'MCQ Assignment not found' });
    }

    console.log('Assignment found:', assignment.title, 'Class:', assignment.class, 'Section:', assignment.section);

    // Check if student is in the correct class (with flexible matching)
    const classMatches = classesMatch(student.class, assignment.class, student.section, assignment.section);
    console.log('Class matching result:', classMatches);
    console.log('Student class:', student.class, 'Student section:', student.section);
    console.log('Assignment class:', assignment.class, 'Assignment section:', assignment.section);
    
    if (!classMatches) {
      console.log('Class mismatch - access denied');
      return res.status(403).json({ message: 'You do not have access to this assignment' });
    }

    // Check if assignment is still active
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    if (now > dueDate) {
      return res.status(400).json({ message: 'This assignment is no longer available' });
    }

    // Check if student already has a submission
    let submission = await MCQSubmission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    console.log('Existing submission found:', submission ? submission.status : 'None');

    if (submission && submission.status === 'Submitted') {
      console.log('Student has already submitted this assignment');
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    // Create new submission if doesn't exist
    if (!submission) {
      console.log('Creating new submission for student');
      submission = new MCQSubmission({
        assignmentId,
        studentId: req.user.id,
        status: 'In Progress',
        startedAt: new Date()
      });
      await submission.save();
      console.log('New submission created:', submission._id);
    }

    // Prepare questions for student
    let questions = [...assignment.questions];
    if (assignment.randomizeQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    if (assignment.randomizeOptions) {
      questions = questions.map(q => ({
        ...q,
        options: q.options.sort(() => Math.random() - 0.5)
      }));
    }

    // Remove correct answer indicators
    questions = questions.map(q => ({
      ...q,
      options: q.options.map(opt => ({
        text: opt.text
      }))
    }));

    res.json({
      message: 'MCQ Assignment started successfully',
      submissionId: submission._id,
      assignment: {
        ...assignment.toObject(),
        questions
      }
    });
  } catch (error) {
    console.error('Error starting MCQ assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit MCQ assignment
exports.submitMCQAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answers } = req.body;
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const assignment = await MCQAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'MCQ Assignment not found' });
    }

    // Check if student is in the correct class (with flexible matching)
    if (!classesMatch(student.class, assignment.class, student.section, assignment.section)) {
      return res.status(403).json({ message: 'You do not have access to this assignment' });
    }

    // Get student's submission
    const submission = await MCQSubmission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (!submission) {
      return res.status(404).json({ message: 'No active submission found for this assignment' });
    }

    if (submission.status === 'Submitted') {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    // Validate answers
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Process answers and calculate score
    const processedAnswers = answers.map(answer => {
      const question = assignment.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) {
        return null;
      }

      const selectedOption = question.options[answer.selectedOption];
      const isCorrect = selectedOption ? selectedOption.isCorrect : false;
      const points = isCorrect ? question.points : 0;

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        points,
        timeSpent: answer.timeSpent || 0
      };
    }).filter(Boolean);

    // Calculate final score
    const totalScore = processedAnswers.reduce((sum, answer) => sum + answer.points, 0);
    const maxPossibleScore = assignment.questions.reduce((sum, question) => sum + question.points, 0);
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Update submission
    submission.answers = processedAnswers;
    submission.submittedAt = new Date();
    submission.status = 'Submitted';
    submission.totalScore = totalScore;
    submission.maxPossibleScore = maxPossibleScore;
    submission.percentage = percentage;

    await submission.save();

    res.json({
      message: 'MCQ Assignment submitted successfully',
      score: totalScore,
      percentage,
      maxPossibleScore,
      timeTaken: submission.timeTaken
    });
  } catch (error) {
    console.error('Error submitting MCQ assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get MCQ submission results
exports.getMCQSubmissionResults = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const assignment = await MCQAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'MCQ Assignment not found' });
    }

    const submission = await MCQSubmission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (!submission) {
      return res.status(404).json({ message: 'No submission found for this assignment' });
    }

    if (submission.status !== 'Submitted') {
      return res.status(400).json({ message: 'Assignment has not been submitted yet' });
    }

    // Calculate performance metrics
    const correctAnswers = submission.answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = assignment.questions.length;
    const questionsAnswered = submission.answers.length;

    // Prepare results in the expected format
    const results = {
      assignment: {
        title: assignment.title,
        description: assignment.description,
        class: assignment.class,
        section: assignment.section,
        subject: assignment.subject,
        questions: assignment.questions,
        maxMarks: assignment.maxMarks,
        dueDate: assignment.dueDate
      },
      submission: {
        answers: submission.answers,
        timeTaken: submission.timeTaken,
        submittedAt: submission.submittedAt,
        status: submission.status
      },
      performance: {
        score: submission.totalScore,
        totalMarks: assignment.questions.reduce((sum, q) => sum + q.points, 0),
        percentage: submission.percentage,
        correctAnswers: correctAnswers,
        incorrectAnswers: questionsAnswered - correctAnswers,
        questionsAnswered: questionsAnswered,
        totalQuestions: totalQuestions
      }
    };

    res.json(results);
  } catch (error) {
    console.error('Error fetching MCQ submission results:', error);
    res.status(500).json({ message: error.message });
  }
}; 