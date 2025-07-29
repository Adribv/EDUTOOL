const Department = require('../../../models/Staff/HOD/department.model');
const ExamPaper = require('../../../models/Staff/HOD/examPaper.model');
const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');

// Get exam papers for moderation
exports.getExamPapersForModeration = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const examPapers = await ExamPaper.find({
      departmentId: department._id,
      status: 'Submitted'
    }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    
    res.json(examPapers);
  } catch (error) {
    console.error('Error fetching exam papers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Moderate an exam paper
exports.moderateExamPaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { status, feedback, changes } = req.body;
    
    const examPaper = await ExamPaper.findById(paperId);
    
    if (!examPaper) {
      return res.status(404).json({ message: 'Exam paper not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if paper belongs to this department
    if (examPaper.departmentId.toString() !== department._id.toString()) {
      return res.status(403).json({ message: 'Exam paper does not belong to your department' });
    }
    
    // Update exam paper status
    examPaper.status = status;
    examPaper.moderationFeedback = feedback;
    examPaper.suggestedChanges = changes;
    examPaper.moderatedBy = req.user.id;
    examPaper.moderatedAt = new Date();
    
    await examPaper.save();
    
    res.json({ message: 'Exam paper moderated successfully', examPaper });
  } catch (error) {
    console.error('Error moderating exam paper:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Monitor grading consistency
exports.monitorGradingConsistency = async (req, res) => {
  try {
    const { subject, class: cls, examId } = req.query;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Build query
    const query = {};
    if (subject) query.subject = subject;
    if (cls) query.class = cls;
    if (examId) query.examId = examId;
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }, '_id name');
    
    const teacherIds = teachers.map(teacher => teacher._id);
    
    // Get exam results graded by department teachers
    const examResults = await ExamResult.find({
      ...query,
      gradedBy: { $in: teacherIds }
    }).populate('gradedBy', 'name');
    
    // Group results by teacher
    const resultsByTeacher = {};
    teachers.forEach(teacher => {
      resultsByTeacher[teacher._id] = {
        teacherId: teacher._id,
        teacherName: teacher.name,
        totalGraded: 0,
        averageScore: 0,
        gradeDistribution: {
          A: 0, B: 0, C: 0, D: 0, F: 0
        },
        results: []
      };
    });
    
    // Process results
    examResults.forEach(result => {
      const teacherId = result.gradedBy._id.toString();
      if (resultsByTeacher[teacherId]) {
        resultsByTeacher[teacherId].totalGraded++;
        resultsByTeacher[teacherId].results.push(result);
        
        // Update grade distribution
        const grade = getGradeFromScore(result.score);
        resultsByTeacher[teacherId].gradeDistribution[grade]++;
      }
    });
    
    // Calculate averages and prepare report
    const consistencyReport = {
      subject: subject || 'All Subjects',
      class: cls || 'All Classes',
      examId: examId || 'All Exams',
      teacherStats: [],
      overallStats: {
        totalResults: examResults.length,
        averageScore: 0,
        gradeDistribution: {
          A: 0, B: 0, C: 0, D: 0, F: 0
        }
      },
      consistencyAnalysis: {
        status: 'Consistent',
        outliers: [],
        recommendations: []
      }
    };
    
    let totalScore = 0;
    
    // Process teacher stats
    for (const teacherId in resultsByTeacher) {
      const teacherData = resultsByTeacher[teacherId];
      if (teacherData.totalGraded > 0) {
        // Calculate average score for this teacher
        const teacherTotalScore = teacherData.results.reduce((sum, result) => sum + result.score, 0);
        teacherData.averageScore = teacherTotalScore / teacherData.totalGraded;
        
        // Add to overall total
        totalScore += teacherTotalScore;
        
        // Add to overall grade distribution
        for (const grade in teacherData.gradeDistribution) {
          consistencyReport.overallStats.gradeDistribution[grade] += teacherData.gradeDistribution[grade];
        }
        
        // Add to teacher stats
        consistencyReport.teacherStats.push({
          teacherId: teacherData.teacherId,
          teacherName: teacherData.teacherName,
          totalGraded: teacherData.totalGraded,
          averageScore: teacherData.averageScore,
          gradeDistribution: teacherData.gradeDistribution
        });
      }
    }
    
    // Calculate overall average
    if (examResults.length > 0) {
      consistencyReport.overallStats.averageScore = totalScore / examResults.length;
    }
    
    // Check for consistency issues
    if (consistencyReport.teacherStats.length > 1) {
      const overallAvg = consistencyReport.overallStats.averageScore;
      
      // Check for outliers (teachers whose average differs significantly from overall)
      consistencyReport.teacherStats.forEach(teacher => {
        const difference = Math.abs(teacher.averageScore - overallAvg);
        const percentDifference = (difference / overallAvg) * 100;
        
        if (percentDifference > 15) { // 15% threshold for outlier
          consistencyReport.consistencyAnalysis.outliers.push({
            teacherId: teacher.teacherId,
            teacherName: teacher.teacherName,
            averageScore: teacher.averageScore,
            difference: difference.toFixed(2),
            percentDifference: percentDifference.toFixed(2) + '%'
          });
        }
      });
      
      // Update consistency status
      if (consistencyReport.consistencyAnalysis.outliers.length > 0) {
        consistencyReport.consistencyAnalysis.status = 'Inconsistent';
        consistencyReport.consistencyAnalysis.recommendations.push(
          'Schedule a department meeting to discuss grading standards',
          'Consider implementing standardized rubrics for assessments',
          'Conduct moderation sessions for future exams'
        );
      }
    }
    
    res.json(consistencyReport);
  } catch (error) {
    console.error('Error monitoring grading consistency:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get grade from score
function getGradeFromScore(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Analyze department performance trends
exports.analyzePerformanceTrends = async (req, res) => {
  try {
    const { academicYear, term } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }, '_id');
    
    const teacherIds = teachers.map(teacher => teacher._id);
    
    // Get exam results for this academic year and term
    const examResults = await ExamResult.find({
      gradedBy: { $in: teacherIds },
      academicYear,
      term
    }).populate('studentId', 'name class section');
    
    // Group results by subject
    const resultsBySubject = {};
    
    examResults.forEach(result => {
      if (!resultsBySubject[result.subject]) {
        resultsBySubject[result.subject] = {
          subject: result.subject,
          totalStudents: 0,
          averageScore: 0,
          passingRate: 0,
          classData: {},
          examData: {}
        };
      }
      
      // Add to subject totals
      resultsBySubject[result.subject].totalStudents++;
      
      // Add to class data
      const classKey = `${result.class}-${result.section}`;
      if (!resultsBySubject[result.subject].classData[classKey]) {
        resultsBySubject[result.subject].classData[classKey] = {
          class: result.class,
          section: result.section,
          totalStudents: 0,
          totalScore: 0,
          passingCount: 0
        };
      }
      
      resultsBySubject[result.subject].classData[classKey].totalStudents++;
      resultsBySubject[result.subject].classData[classKey].totalScore += result.score;
      if (result.score >= 40) { // Assuming 40 is passing score
        resultsBySubject[result.subject].classData[classKey].passingCount++;
      }
      
      // Add to exam data
      if (!resultsBySubject[result.subject].examData[result.examId]) {
        resultsBySubject[result.subject].examData[result.examId] = {
          examId: result.examId,
          examName: result.examName,
          totalStudents: 0,
          totalScore: 0,
          passingCount: 0
        };
      }
      
      resultsBySubject[result.subject].examData[result.examId].totalStudents++;
      resultsBySubject[result.subject].examData[result.examId].totalScore += result.score;
      if (result.score >= 40) {
        resultsBySubject[result.subject].examData[result.examId].passingCount++;
      }
    });
    
    // Calculate averages and passing rates
    for (const subject in resultsBySubject) {
      const subjectData = resultsBySubject[subject];
      
      // Calculate subject averages
      let totalScore = 0;
      let passingCount = 0;
      
      // Process class data
      for (const classKey in subjectData.classData) {
        const classData = subjectData.classData[classKey];
        totalScore += classData.totalScore;
        passingCount += classData.passingCount;
        
        // Calculate class average and passing rate
        classData.averageScore = classData.totalScore / classData.totalStudents;
        classData.passingRate = (classData.passingCount / classData.totalStudents) * 100;
      }
      
      // Process exam data
      for (const examId in subjectData.examData) {
        const examData = subjectData.examData[examId];
        
        // Calculate exam average and passing rate
        examData.averageScore = examData.totalScore / examData.totalStudents;
        examData.passingRate = (examData.passingCount / examData.totalStudents) * 100;
      }
      
      // Calculate subject average and passing rate
      subjectData.averageScore = totalScore / subjectData.totalStudents;
      subjectData.passingRate = (passingCount / subjectData.totalStudents) * 100;
    }
    
    // Identify subjects or topics needing intervention
    const performanceAnalysis = {
      academicYear,
      term,
      departmentName: department.name,
      subjectPerformance: Object.values(resultsBySubject),
      interventionNeeded: []
    };
    
    // Check for subjects with low passing rates
    for (const subject in resultsBySubject) {
      const subjectData = resultsBySubject[subject];
      
      if (subjectData.passingRate < 70) { // Threshold for intervention
        performanceAnalysis.interventionNeeded.push({
          subject,
          passingRate: subjectData.passingRate,
          averageScore: subjectData.averageScore,
          reason: 'Low passing rate',
          recommendedActions: [
            'Review teaching methodologies',
            'Provide additional support materials',
            'Consider remedial classes'
          ]
        });
      }
      
      // Check for specific classes with issues
      for (const classKey in subjectData.classData) {
        const classData = subjectData.classData[classKey];
        
        if (classData.passingRate < 60) { // Lower threshold for class-specific intervention
          performanceAnalysis.interventionNeeded.push({
            subject,
            class: classData.class,
            section: classData.section,
            passingRate: classData.passingRate,
            averageScore: classData.averageScore,
            reason: 'Class-specific performance issue',
            recommendedActions: [
              'Teacher-student consultation',
              'Targeted intervention for this class',
              'Review teaching approach for this specific class'
            ]
          });
        }
      }
    }
    
    res.json(performanceAnalysis);
  } catch (error) {
    console.error('Error analyzing performance trends:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Review student performance by teacher
exports.reviewTeacherPerformance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(teacherId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Get teacher details
    const teacher = await Staff.findById(teacherId, 'name email assignedSubjects');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Get exam results for this teacher
    const examResults = await ExamResult.find({
      gradedBy: teacherId
    }).populate('studentId', 'name class section');
    
    // Group results by subject and class
    const performanceBySubjectClass = {};
    
    teacher.assignedSubjects.forEach(assignment => {
      const key = `${assignment.subject}-${assignment.class}-${assignment.section}`;
      performanceBySubjectClass[key] = {
        subject: assignment.subject,
        class: assignment.class,
        section: assignment.section,
        totalStudents: 0,
        averageScore: 0,
        passingRate: 0,
        examResults: []
      };
    });
    
    // Process exam results
    examResults.forEach(result => {
      const key = `${result.subject}-${result.class}-${result.section}`;
      
      if (performanceBySubjectClass[key]) {
        performanceBySubjectClass[key].examResults.push({
          examId: result.examId,
          examName: result.examName,
          studentId: result.studentId._id,
          studentName: result.studentId.name,
          score: result.score,
          grade: getGradeFromScore(result.score)
        });
      }
    });
    
    // Calculate statistics
    for (const key in performanceBySubjectClass) {
      const data = performanceBySubjectClass[key];
      data.totalStudents = data.examResults.length;
      
      if (data.totalStudents > 0) {
        const totalScore = data.examResults.reduce((sum, result) => sum + result.score, 0);
        data.averageScore = totalScore / data.totalStudents;
        
        const passingCount = data.examResults.filter(result => result.score >= 40).length;
        data.passingRate = (passingCount / data.totalStudents) * 100;
      }
    }
    
    const teacherPerformance = {
      teacherId: teacher._id,
      teacherName: teacher.name,
      email: teacher.email,
      performanceBySubjectClass: Object.values(performanceBySubjectClass),
      overallPerformance: {
        totalStudentsAssessed: examResults.length,
        averageScore: 0,
        passingRate: 0
      }
    };
    
    // Calculate overall performance
    if (examResults.length > 0) {
      const totalScore = examResults.reduce((sum, result) => sum + result.score, 0);
      teacherPerformance.overallPerformance.averageScore = totalScore / examResults.length;
      
      const passingCount = examResults.filter(result => result.score >= 40).length;
      teacherPerformance.overallPerformance.passingRate = (passingCount / examResults.length) * 100;
    }
    
    res.json(teacherPerformance);
  } catch (error) {
    console.error('Error reviewing teacher performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new exam paper
exports.createExamPaper = async (req, res) => {
  try {
    const { 
      subject, 
      class: cls, 
      section, 
      examType, 
      examDate, 
      duration, 
      totalMarks, 
      passingMarks,
      instructions,
      sections
    } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if subject is offered by department
    if (!department.subjects.includes(subject)) {
      return res.status(400).json({ message: 'Subject not offered by department' });
    }
    
    const examPaper = new ExamPaper({
      departmentId: department._id,
      subject,
      class: cls,
      section,
      examType,
      examDate,
      duration,
      totalMarks,
      passingMarks,
      instructions,
      sections,
      status: 'Draft',
      createdBy: req.user.id
    });
    
    await examPaper.save();
    
    res.status(201).json({ message: 'Exam paper created successfully', examPaper });
  } catch (error) {
    console.error('Error creating exam paper:', error);
    res.status(500).json({ message: 'Server error' });
  }
};