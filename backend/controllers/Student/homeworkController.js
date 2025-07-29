const Student = require('../../models/Student/studentModel');
const Homework = require('../../models/Staff/Teacher/homework.model');
const HomeworkSubmission = require('../../models/Student/homeworkSubmissionModel');

// Get all homework
exports.getHomework = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get homework for student's class
    const homework = await Homework.find({
      class: student.class,
      section: student.section
    }).sort({ dueDate: 1 });
    
    // Get submission status for each homework
    const homeworkWithStatus = await Promise.all(homework.map(async (hw) => {
      const submission = await HomeworkSubmission.findOne({
        homeworkId: hw._id,
        studentId: student._id
      });
      
      return {
        ...hw.toObject(),
        submissionStatus: submission ? submission.status : 'Not Submitted',
        submissionId: submission ? submission._id : null
      };
    }));
    
    res.json(homeworkWithStatus);
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get homework details
exports.getHomeworkDetails = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    
    const homework = await Homework.findById(homeworkId)
      .populate('teacherId', 'name');
    
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    
    // Check if homework is for student's class
    const student = await Student.findById(req.user.id);
    if (homework.class !== student.class || homework.section !== student.section) {
      return res.status(403).json({ message: 'Not authorized to view this homework' });
    }
    
    // Get submission if exists
    const submission = await HomeworkSubmission.findOne({
      homeworkId,
      studentId: student._id
    });
    
    res.json({
      homework,
      submission
    });
  } catch (error) {
    console.error('Error fetching homework details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit homework
exports.submitHomework = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const { content } = req.body;
    
    // Check if homework exists and is valid for this student
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    
    const student = await Student.findById(req.user.id);
    if (homework.class !== student.class || homework.section !== student.section) {
      return res.status(403).json({ message: 'This homework is not for your class' });
    }
    
    // Check if due date has passed
    if (new Date() > new Date(homework.dueDate)) {
      return res.status(400).json({ message: 'Homework submission deadline has passed' });
    }
    
    // Check if already submitted
    let submission = await HomeworkSubmission.findOne({
      homeworkId,
      studentId: student._id
    });
    
    // Handle file upload if any
    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/homework/${req.file.filename}`;
    }
    
    if (submission) {
      // Update existing submission
      submission.content = content;
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.submittedAt = new Date();
      submission.status = 'Submitted';
    } else {
      // Create new submission
      submission = new HomeworkSubmission({
        homeworkId,
        studentId: student._id,
        content,
        fileUrl,
        status: 'Submitted'
      });
    }
    
    await submission.save();
    res.status(201).json({ message: 'Homework submitted successfully', submission });
  } catch (error) {
    console.error('Error submitting homework:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get homework submissions
exports.getHomeworkSubmissions = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const submissions = await HomeworkSubmission.find({
      studentId: student._id
    })
    .populate('homeworkId', 'title subject dueDate')
    .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching homework submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};