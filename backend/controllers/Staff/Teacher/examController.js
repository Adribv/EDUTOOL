const Exam = require('../../../models/Staff/Teacher/exam.model');
const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
const VPExam = require('../../../models/Staff/HOD/examPaper.model');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');

// Import ExamTimetable model for VP-scheduled exams
const mongoose = require('mongoose');
const examTimetableSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  examName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  examType: {
    type: String,
    required: true
  },
  room: {
    type: String,
    default: 'Main Hall'
  },
  invigilator: {
    type: String,
    default: 'To be assigned'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  }
}, { timestamps: true });

const ExamTimetable = mongoose.models.ExamTimetable || mongoose.model('ExamTimetable', examTimetableSchema);

// Create exam
exports.createExam = async (req, res) => {
  try {
    const { title, description, class: cls, section, subject, date, duration, totalMarks } = req.body;
    const questionPaperUrl = req.file ? req.file.path : '';
    
    // Check if teacher is assigned to this class and subject
    const staff = await Staff.findById(req.user.id);
    
    // Check if teacher is assigned as a subject teacher
    const isSubjectAssigned = staff.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    // Check if teacher is assigned as a class coordinator
    let isCoordinatorAssigned = false;
    if (staff.coordinator && staff.coordinator.length > 0) {
      const Class = require('../../../models/Admin/classModel');
      const coordinatedClasses = await Class.find({ _id: { $in: staff.coordinator } });
      isCoordinatorAssigned = coordinatedClasses.some(
        coord => coord.grade === cls && coord.section === section
      );
    }
    
    if (!isSubjectAssigned && !isCoordinatorAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class/subject as a teacher or coordinator' });
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

// Get exams for teacher (both created by teacher and VP-scheduled for teacher's classes)
exports.getExams = async (req, res) => {
  try {
    // Get teacher's assigned subjects to determine which classes they teach
    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get teacher's assigned classes and subjects
    const assignedSubjects = staff.assignedSubjects || [];
    
    // Build teacher classes from assigned subjects
    const subjectClasses = assignedSubjects.map(subject => ({
      class: subject.class,
      section: subject.section,
      subject: subject.subject,
      type: 'subject'
    }));
    
    // Build teacher classes from coordinator assignments (for Class Coordinators)
    let coordinatorClasses = [];
    if (staff.coordinator && staff.coordinator.length > 0) {
      // Populate coordinator classes to get grade and section
      const Class = require('../../../models/Admin/classModel');
      const coordinatedClasses = await Class.find({ _id: { $in: staff.coordinator } });
      
      coordinatorClasses = coordinatedClasses.map(cls => ({
        class: cls.grade,
        section: cls.section,
        subject: 'All', // Class coordinators see all subjects for their class
        type: 'coordinator'
      }));
    }
    
    // Combine both types of assignments
    const teacherClasses = [...subjectClasses, ...coordinatorClasses];

    console.log('Teacher assigned classes:', teacherClasses);
    console.log('Subject assignments:', subjectClasses.length);
    console.log('Coordinator assignments:', coordinatorClasses.length);

    // Get teacher-created exams
    const teacherExams = await Exam.find({ createdBy: req.user.id });
    console.log(`Found ${teacherExams.length} teacher-created exams`);

    // Get VP-scheduled exams for teacher's classes
    const vpExamFilter = {
      status: { $in: ['Scheduled', 'In Progress'] }, // ExamTimetable uses different status values
      $or: teacherClasses.map(cls => {
        if (cls.type === 'coordinator') {
          // Class coordinators see all subjects for their specific coordinated class grade
          return {
            grade: cls.class // ExamTimetable uses 'grade' instead of 'class'
          };
        } else {
          // Subject teachers see specific subjects for their class/section
          return {
            grade: cls.class, // ExamTimetable uses 'grade' instead of 'class'
            subject: cls.subject
            // Note: ExamTimetable doesn't have section field
          };
        }
      })
    };

    console.log('VP exam filter:', JSON.stringify(vpExamFilter, null, 2));

    const vpExams = await ExamTimetable.find(vpExamFilter)
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .sort({ examDate: 1 });

    console.log(`Found ${vpExams.length} VP-scheduled exams for teacher's classes`);

    // Transform VP exams to match teacher exam format
    const transformedVpExams = vpExams.map(exam => ({
      _id: exam._id,
      title: exam.examName + ' - ' + exam.examType,
      description: `${exam.subject} exam scheduled by VP`,
      class: exam.grade, // Map grade to class for consistency
      section: null, // ExamTimetable doesn't have section
      subject: exam.subject,
      date: exam.examDate,
      examDate: exam.examDate,
      duration: exam.duration,
      totalMarks: null, // ExamTimetable doesn't have totalMarks
      passingMarks: null, // ExamTimetable doesn't have passingMarks
      createdBy: exam.createdBy,
      createdAt: exam.createdAt,
      status: exam.status,
      examType: exam.examType,
      isVPScheduled: true, // Flag to identify VP-scheduled exams
      departmentId: exam.departmentId,
      startTime: exam.startTime,
      endTime: exam.endTime,
      room: exam.room,
      invigilator: exam.invigilator
    }));

    // Combine teacher exams and VP exams
    const allExams = [
      ...teacherExams.map(exam => ({ ...exam.toObject(), isVPScheduled: false })),
      ...transformedVpExams
    ];

    // Sort by date
    allExams.sort((a, b) => new Date(a.date || a.examDate) - new Date(b.date || b.examDate));

    console.log(`Returning ${allExams.length} total exams for teacher`);
    res.json(allExams);
  } catch (error) {
    console.error('Error fetching teacher exams:', error);
    res.status(500).json({ message: error.message });
  }
};

// Enter exam results
exports.enterExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // Array of { studentId, marksObtained, feedback }
    
    // Check if teacher created this exam or is coordinator for the class
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    const staff = await Staff.findById(req.user.id);
    const isCreator = exam.createdBy.toString() === req.user.id;
    let isCoordinator = false;
    if (staff.coordinator && staff.coordinator.length > 0) {
      const Class = require('../../../models/Admin/classModel');
      const coordinatedClasses = await Class.find({ _id: { $in: staff.coordinator } });
      isCoordinator = coordinatedClasses.some(
        coord => coord.grade === exam.class && coord.section === exam.section
      );
    }
    
    if (!isCreator && !isCoordinator) {
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
    
    // Check if teacher created this exam or is coordinator for the class
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    const staff = await Staff.findById(req.user.id);
    const isCreator = exam.createdBy.toString() === req.user.id;
    let isCoordinator = false;
    if (staff.coordinator && staff.coordinator.length > 0) {
      const Class = require('../../../models/Admin/classModel');
      const coordinatedClasses = await Class.find({ _id: { $in: staff.coordinator } });
      isCoordinator = coordinatedClasses.some(
        coord => coord.grade === exam.class && coord.section === exam.section
      );
    }
    
    if (!isCreator && !isCoordinator) {
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

// Get VP-scheduled exams that teachers can view
exports.getVPScheduledExams = async (req, res) => {
  try {
    const { grade } = req.query;
    console.log('Fetching VP exams with grade filter:', grade);
    
    // Build filter object
    const filter = { 
      status: { $in: ['Approved', 'Published'] }
    };
    
    // Add grade filter if provided
    if (grade && grade !== 'all') {
      filter.class = grade;
    }
    
    console.log('VP exam filter:', filter);
    
    // Get VP-scheduled exams that are published
    const vpExams = await VPExam.find(filter)
    .populate('departmentId', 'name')
    .populate('createdBy', 'name email')
    .sort({ examDate: 1 });
    
    console.log(`Found ${vpExams.length} VP exams`);
    
    // Transform the data to match frontend expectations
    const transformedExams = vpExams.map(exam => ({
      _id: exam._id,
      id: exam._id,
      subject: exam.subject,
      class: exam.class,
      grade: exam.class,
      section: exam.section,
      examType: exam.examType,
      type: exam.examType,
      examDate: exam.examDate,
      date: exam.examDate,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      instructions: exam.instructions,
      departmentId: exam.departmentId,
      status: exam.status,
      createdBy: exam.createdBy,
      createdAt: exam.createdAt
    }));
    
    console.log('Sending transformed exams:', transformedExams.length);
    res.json(transformedExams);
  } catch (error) {
    console.error('Error fetching VP-scheduled exams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate mark sheet for a class/exam
exports.generateMarkSheet = async (req, res) => {
  try {
    const { examId, class: cls, section } = req.query;
    const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
    const Student = require('../../../models/Student/studentModel');
    const results = await ExamResult.find({ examId, class: cls, section }).populate('studentId', 'name rollNumber');
    const markSheet = results.map(r => ({
      student: r.studentId?.name,
      rollNumber: r.studentId?.rollNumber,
      marks: r.score,
      grade: r.grade,
      status: r.status
    }));
    res.json({ success: true, data: markSheet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate transcript for a student
exports.generateTranscript = async (req, res) => {
  try {
    const { studentId } = req.query;
    const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
    const results = await ExamResult.find({ studentId }).populate('examId', 'title date subject totalMarks');
    const transcript = results.map(r => ({
      exam: r.examId?.title,
      subject: r.examId?.subject,
      date: r.examId?.date,
      marks: r.score,
      grade: r.grade,
      totalMarks: r.examId?.totalMarks
    }));
    res.json({ success: true, data: transcript });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lock/unlock exam paper (secure content)
exports.lockExamPaper = async (req, res) => {
  try {
    const { examPaperId, lock } = req.body;
    const ExamPaper = require('../../../models/Staff/HOD/examPaper.model');
    const paper = await ExamPaper.findById(examPaperId);
    if (!paper) return res.status(404).json({ message: 'Exam paper not found' });
    paper.status = lock ? 'Locked' : 'Draft';
    await paper.save();
    res.json({ success: true, message: `Exam paper ${lock ? 'locked' : 'unlocked'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Moderate exam paper (approve/reject)
exports.moderateExamPaper = async (req, res) => {
  try {
    const { examPaperId, action, feedback } = req.body;
    const ExamPaper = require('../../../models/Staff/HOD/examPaper.model');
    const paper = await ExamPaper.findById(examPaperId);
    if (!paper) return res.status(404).json({ message: 'Exam paper not found' });
    if (action === 'approve') {
      paper.status = 'Approved';
      paper.moderationFeedback = feedback || '';
    } else if (action === 'reject') {
      paper.status = 'Rejected';
      paper.moderationFeedback = feedback || '';
    }
    await paper.save();
    res.json({ success: true, message: `Exam paper ${action}d` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Exam analytics: grade distribution, average, top/bottom performers
exports.examAnalytics = async (req, res) => {
  try {
    const { examId } = req.query;
    const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
    const results = await ExamResult.find({ examId });
    if (!results.length) return res.json({ success: true, data: { average: 0, gradeDistribution: {}, top: null, bottom: null } });
    const total = results.reduce((sum, r) => sum + (r.score || 0), 0);
    const average = total / results.length;
    const gradeDistribution = {};
    results.forEach(r => { gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1; });
    const sorted = results.sort((a, b) => b.score - a.score);
    res.json({ success: true, data: { average, gradeDistribution, top: sorted[0], bottom: sorted[sorted.length - 1] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all exam timetables (for examiner dashboard)
exports.getAllExamTimetables = async (req, res) => {
  try {
    const timetables = await ExamTimetable.find().populate('departmentId', 'name').populate('createdBy', 'name email');
    res.json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all exams (for examiner dashboard)
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all exam papers (for examiner dashboard)
exports.getAllExamPapers = async (req, res) => {
  try {
    const papers = await VPExam.find();
    res.json({ success: true, data: papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all staff (for invigilator assignment)
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({}, 'name email role');
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update exam timetable (assign invigilator/room)
exports.updateExamTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { invigilator, room } = req.body;
    const timetable = await ExamTimetable.findById(id);
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    if (invigilator) timetable.invigilator = invigilator;
    if (room) timetable.room = room;
    await timetable.save();
    res.json({ success: true, message: 'Timetable updated', data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};