const Student = require('../../models/Student/studentModel');
const Exam = require('../../models/Staff/Teacher/exam.model');
const ExamResult = require('../../models/Staff/Teacher/examResult.model');
const ReportCard = require('../../models/Student/reportCardModel');

// Get upcoming exams
exports.getUpcomingExams = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const currentDate = new Date();
    
    const exams = await Exam.find({
      class: student.class,
      section: student.section,
      date: { $gte: currentDate }
    }).sort({ date: 1 });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching upcoming exams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admit card
exports.getAdmitCard = async (req, res) => {
  try {
    const { examId } = req.params;
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Check if exam is for student's class
    if (exam.class !== student.class || exam.section !== student.section) {
      return res.status(403).json({ message: 'This exam is not for your class' });
    }
    
    // Check if admit cards are available
    if (!exam.admitCardsAvailable) {
      return res.status(400).json({ message: 'Admit cards are not yet available for this exam' });
    }
    
    // Generate admit card data
    const admitCard = {
      examName: exam.title,
      examDate: exam.date,
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section
      },
      subjects: exam.subjects,
      venue: exam.venue,
      instructions: exam.instructions
    };
    
    res.json(admitCard);
  } catch (error) {
    console.error('Error fetching admit card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get exam results
exports.getExamResults = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const examResults = await ExamResult.find({
      studentId: student._id
    }).populate('examId', 'title date type');
    
    res.json(examResults);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get report cards
exports.getReportCards = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const reportCards = await ReportCard.find({
      studentId: student._id
    }).sort({ academicYear: -1, term: -1 });
    
    res.json(reportCards);
  } catch (error) {
    console.error('Error fetching report cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance analytics
exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const examResults = await ExamResult.find({
      studentId: student._id
    }).populate('examId', 'title date type subject');
    
    // Group results by subject
    const subjectPerformance = {};
    
    examResults.forEach(result => {
      const subject = result.examId.subject;
      
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = {
          scores: [],
          average: 0,
          highest: 0,
          lowest: 100
        };
      }
      
      subjectPerformance[subject].scores.push(result.score);
      
      // Update highest and lowest scores
      if (result.score > subjectPerformance[subject].highest) {
        subjectPerformance[subject].highest = result.score;
      }
      
      if (result.score < subjectPerformance[subject].lowest) {
        subjectPerformance[subject].lowest = result.score;
      }
    });
    
    // Calculate averages
    Object.keys(subjectPerformance).forEach(subject => {
      const scores = subjectPerformance[subject].scores;
      const sum = scores.reduce((total, score) => total + score, 0);
      subjectPerformance[subject].average = sum / scores.length;
    });
    
    res.json({
      subjectPerformance,
      overallPerformance: {
        examsTaken: examResults.length,
        averageScore: examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length
      }
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};