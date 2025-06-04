const Exam = require('../../../models/Staff/Teacher/exam.model');
const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');

// Create exam
exports.createExam = async (req, res) => {
  try {
    const { title, description, class: cls, section, subject, date, duration, totalMarks } = req.body;
    const questionPaperUrl = req.file ? req.file.path : '';
    
    // Check if teacher is assigned to this class and subject
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class/subject' });
    }
    
    const exam = new Exam({
      title,
      description,
      class: cls,
      section,
      subject,
      date,
      duration,
      totalMarks,
      questionPaperUrl,
      createdBy: req.user.id
    });
    
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get exams created by teacher
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user.id });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enter exam results
exports.enterExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // Array of { studentId, marksObtained, feedback }
    
    // Check if teacher created this exam
    const exam = await Exam.findById(examId);
    if (!exam || exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this exam' });
    }
    
    // Delete existing results for this exam
    await ExamResult.deleteMany({ examId });
    
    // Create new results
    const examResults = results.map(result => ({
      examId,
      studentId: result.studentId,
      marksObtained: result.marksObtained,
      feedback: result.feedback,
      enteredBy: req.user.id
    }));
    
    const savedResults = await ExamResult.insertMany(examResults);
    res.status(201).json(savedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate performance report
exports.generatePerformanceReport = async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Check if teacher created this exam
    const exam = await Exam.findById(examId);
    if (!exam || exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this exam' });
    }
    
    // Get all students in the class
    const students = await Student.find({ 
      class: exam.class, 
      section: exam.section 
    });
    
    // Get results for this exam
    const results = await ExamResult.find({ examId });
    
    // Calculate statistics
    const totalStudents = students.length;
    const totalMarks = exam.totalMarks;
    const resultsWithMarks = results.filter(result => result.marksObtained !== undefined);
    const totalSubmitted = resultsWithMarks.length;
    const highestMarks = Math.max(...resultsWithMarks.map(result => result.marksObtained), 0);
    const lowestMarks = Math.min(...resultsWithMarks.map(result => result.marksObtained), totalMarks);
    const averageMarks = totalSubmitted > 0 
      ? resultsWithMarks.reduce((sum, result) => sum + result.marksObtained, 0) / totalSubmitted 
      : 0;
    
    // Combine student info with results
    const studentResults = students.map(student => {
      const result = results.find(r => r.studentId.toString() === student._id.toString());
      return {
        name: student.name,
        rollNumber: student.rollNumber,
        marksObtained: result ? result.marksObtained : 'Not Submitted',
        percentage: result ? (result.marksObtained / totalMarks) * 100 : 0,
        feedback: result ? result.feedback : ''
      };
    });
    
    // Sort by marks in descending order
    studentResults.sort((a, b) => {
      if (a.marksObtained === 'Not Submitted') return 1;
      if (b.marksObtained === 'Not Submitted') return -1;
      return b.marksObtained - a.marksObtained;
    });
    
    const report = {
      examDetails: exam,
      statistics: {
        totalStudents,
        totalSubmitted,
        highestMarks,
        lowestMarks,
        averageMarks,
        passPercentage: totalSubmitted > 0 
          ? (resultsWithMarks.filter(r => r.marksObtained >= totalMarks * 0.4).length / totalSubmitted) * 100 
          : 0
      },
      studentResults
    };
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};