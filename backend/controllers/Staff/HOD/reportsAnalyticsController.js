const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');
const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
const Attendance = require('../../../models/Staff/Teacher/attendance.model');
const LessonPlan = require('../../../models/Staff/Teacher/lessonplan.model');
const ImprovementPlan = require('../../../models/Staff/HOD/improvementPlan.model'); // You'll need to create this model

// Generate department performance report
exports.generateDepartmentReport = async (req, res) => {
  try {
    const { academicYear, term } = req.query;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    });
    
    const teacherIds = teachers.map(teacher => teacher._id);
    
    // Build query for exam results
    const examQuery = {};
    if (academicYear) examQuery.academicYear = academicYear;
    if (term) examQuery.term = term;
    
    // Get exam results for department subjects
    const examResults = await ExamResult.find({
      ...examQuery,
      subject: { $in: department.subjects },
      gradedBy: { $in: teacherIds }
    });
    
    // Calculate performance metrics
    const performanceReport = {
      departmentName: department.name,
      academicYear: academicYear || 'All',
      term: term || 'All',
      generatedAt: new Date(),
      overallPerformance: {
        totalStudents: 0,
        averageScore: 0,
        passingRate: 0,
        gradeDistribution: {
          A: 0, B: 0, C: 0, D: 0, F: 0
        }
      },
      subjectPerformance: [],
      teacherPerformance: []
    };
    
    // Process exam results
    if (examResults.length > 0) {
      // Calculate overall metrics
      const totalScore = examResults.reduce((sum, result) => sum + result.score, 0);
      performanceReport.overallPerformance.totalStudents = examResults.length;
      performanceReport.overallPerformance.averageScore = totalScore / examResults.length;
      
      // Calculate passing rate
      const passingResults = examResults.filter(result => result.score >= 60);
      performanceReport.overallPerformance.passingRate = (passingResults.length / examResults.length) * 100;
      
      // Calculate grade distribution
      examResults.forEach(result => {
        if (result.score >= 90) performanceReport.overallPerformance.gradeDistribution.A++;
        else if (result.score >= 80) performanceReport.overallPerformance.gradeDistribution.B++;
        else if (result.score >= 70) performanceReport.overallPerformance.gradeDistribution.C++;
        else if (result.score >= 60) performanceReport.overallPerformance.gradeDistribution.D++;
        else performanceReport.overallPerformance.gradeDistribution.F++;
      });
      
      // Group by subject
      const subjectResults = {};
      department.subjects.forEach(subject => {
        subjectResults[subject] = {
          subject,
          totalStudents: 0,
          averageScore: 0,
          passingRate: 0
        };
      });
      
      examResults.forEach(result => {
        if (subjectResults[result.subject]) {
          subjectResults[result.subject].totalStudents++;
          subjectResults[result.subject].totalScore = (subjectResults[result.subject].totalScore || 0) + result.score;
        }
      });
      
      // Calculate subject averages
      for (const subject in subjectResults) {
        if (subjectResults[subject].totalStudents > 0) {
          subjectResults[subject].averageScore = subjectResults[subject].totalScore / subjectResults[subject].totalStudents;
          
          // Calculate passing rate for subject
          const subjectPassingResults = examResults.filter(
            result => result.subject === subject && result.score >= 60
          );
          subjectResults[subject].passingRate = (subjectPassingResults.length / subjectResults[subject].totalStudents) * 100;
          
          // Add to report
          performanceReport.subjectPerformance.push({
            subject,
            totalStudents: subjectResults[subject].totalStudents,
            averageScore: subjectResults[subject].averageScore,
            passingRate: subjectResults[subject].passingRate
          });
        }
      }
      
      // Group by teacher
      const teacherResults = {};
      teachers.forEach(teacher => {
        teacherResults[teacher._id] = {
          teacherId: teacher._id,
          teacherName: teacher.name,
          totalStudents: 0,
          averageScore: 0,
          passingRate: 0
        };
      });
      
      examResults.forEach(result => {
        const teacherId = result.gradedBy.toString();
        if (teacherResults[teacherId]) {
          teacherResults[teacherId].totalStudents++;
          teacherResults[teacherId].totalScore = (teacherResults[teacherId].totalScore || 0) + result.score;
        }
      });
      
      // Calculate teacher averages
      for (const teacherId in teacherResults) {
        if (teacherResults[teacherId].totalStudents > 0) {
          teacherResults[teacherId].averageScore = teacherResults[teacherId].totalScore / teacherResults[teacherId].totalStudents;
          
          // Calculate passing rate for teacher
          const teacherPassingResults = examResults.filter(
            result => result.gradedBy.toString() === teacherId && result.score >= 60
          );
          teacherResults[teacherId].passingRate = (teacherPassingResults.length / teacherResults[teacherId].totalStudents) * 100;
          
          // Add to report
          performanceReport.teacherPerformance.push({
            teacherId,
            teacherName: teacherResults[teacherId].teacherName,
            totalStudents: teacherResults[teacherId].totalStudents,
            averageScore: teacherResults[teacherId].averageScore,
            passingRate: teacherResults[teacherId].passingRate
          });
        }
      }
    }
    
    res.json(performanceReport);
  } catch (error) {
    console.error('Error generating department report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Analyze learning trends across subjects
exports.analyzeLearningTrends = async (req, res) => {
  try {
    const { academicYear, compareWithPrevious } = req.query;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get current academic year data
    const currentYearResults = await ExamResult.find({
      subject: { $in: department.subjects },
      academicYear
    });
    
    // Group by term and subject
    const termData = {
      'Term 1': {},
      'Term 2': {},
      'Term 3': {}
    };
    
    department.subjects.forEach(subject => {
      termData['Term 1'][subject] = { totalScore: 0, count: 0 };
      termData['Term 2'][subject] = { totalScore: 0, count: 0 };
      termData['Term 3'][subject] = { totalScore: 0, count: 0 };
    });
    
    // Process current year results
    currentYearResults.forEach(result => {
      if (termData[result.term] && termData[result.term][result.subject]) {
        termData[result.term][result.subject].totalScore += result.score;
        termData[result.term][result.subject].count++;
      }
    });
    
    // Calculate averages
    const trends = {
      academicYear,
      subjects: department.subjects,
      termData: {}
    };
    
    for (const term in termData) {
      trends.termData[term] = {};
      
      for (const subject in termData[term]) {
        if (termData[term][subject].count > 0) {
          trends.termData[term][subject] = {
            averageScore: termData[term][subject].totalScore / termData[term][subject].count,
            studentCount: termData[term][subject].count
          };
        } else {
          trends.termData[term][subject] = {
            averageScore: 0,
            studentCount: 0
          };
        }
      }
    }
    
    // Compare with previous year if requested
    if (compareWithPrevious === 'true') {
      const previousYear = (parseInt(academicYear) - 1).toString();
      
      const previousYearResults = await ExamResult.find({
        subject: { $in: department.subjects },
        academicYear: previousYear
      });
      
      const previousTermData = {
        'Term 1': {},
        'Term 2': {},
        'Term 3': {}
      };
      
      department.subjects.forEach(subject => {
        previousTermData['Term 1'][subject] = { totalScore: 0, count: 0 };
        previousTermData['Term 2'][subject] = { totalScore: 0, count: 0 };
        previousTermData['Term 3'][subject] = { totalScore: 0, count: 0 };
      });
      
      // Process previous year results
      previousYearResults.forEach(result => {
        if (previousTermData[result.term] && previousTermData[result.term][result.subject]) {
          previousTermData[result.term][result.subject].totalScore += result.score;
          previousTermData[result.term][result.subject].count++;
        }
      });
      
      // Calculate previous year averages and compare
      trends.comparisonData = {
        previousAcademicYear: previousYear,
        termData: {}
      };
      
      for (const term in previousTermData) {
        trends.comparisonData.termData[term] = {};
        
        for (const subject in previousTermData[term]) {
          if (previousTermData[term][subject].count > 0) {
            const previousAvg = previousTermData[term][subject].totalScore / previousTermData[term][subject].count;
            const currentAvg = trends.termData[term][subject].averageScore;
            
            trends.comparisonData.termData[term][subject] = {
              previousAverageScore: previousAvg,
              currentAverageScore: currentAvg,
              changePercentage: currentAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
            };
          } else {
            trends.comparisonData.termData[term][subject] = {
              previousAverageScore: 0,
              currentAverageScore: trends.termData[term][subject].averageScore,
              changePercentage: 0
            };
          }
        }
      }
    }
    
    res.json(trends);
  } catch (error) {
    console.error('Error analyzing learning trends:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Compare class and teacher performance metrics
exports.comparePerformanceMetrics = async (req, res) => {
  try {
    const { academicYear, term, subject } = req.query;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Build query
    const query = {};
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    if (subject) query.subject = subject;
    else query.subject = { $in: department.subjects };
    
    // Get exam results
    const examResults = await ExamResult.find(query)
      .populate('gradedBy', 'name')
      .populate('studentId', 'name class section');
    
    // Group by class
    const classSectionData = {};
    
    examResults.forEach(result => {
      if (result.studentId) {
        const classKey = `${result.studentId.class}-${result.studentId.section}`;
        
        if (!classSectionData[classKey]) {
          classSectionData[classKey] = {
            class: result.studentId.class,
            section: result.studentId.section,
            totalScore: 0,
            count: 0,
            passingCount: 0,
            teacherData: {}
          };
        }
        
        classSectionData[classKey].totalScore += result.score;
        classSectionData[classKey].count++;
        if (result.score >= 60) classSectionData[classKey].passingCount++;
        
        // Group by teacher within class
        if (result.gradedBy) {
          const teacherId = result.gradedBy._id.toString();
          
          if (!classSectionData[classKey].teacherData[teacherId]) {
            classSectionData[classKey].teacherData[teacherId] = {
              teacherId,
              teacherName: result.gradedBy.name,
              totalScore: 0,
              count: 0,
              passingCount: 0
            };
          }
          
          classSectionData[classKey].teacherData[teacherId].totalScore += result.score;
          classSectionData[classKey].teacherData[teacherId].count++;
          if (result.score >= 60) classSectionData[classKey].teacherData[teacherId].passingCount++;
        }
      }
    });
    
    // Calculate averages and prepare comparison data
    const comparisonData = {
      academicYear: academicYear || 'All',
      term: term || 'All',
      subject: subject || 'All Subjects',
      classData: []
    };
    
    for (const classKey in classSectionData) {
      const classData = classSectionData[classKey];
      
      if (classData.count > 0) {
        const classAverage = classData.totalScore / classData.count;
        const classPassingRate = (classData.passingCount / classData.count) * 100;
        
        const teacherComparison = [];
        
        for (const teacherId in classData.teacherData) {
          const teacherData = classData.teacherData[teacherId];
          
          if (teacherData.count > 0) {
            const teacherAverage = teacherData.totalScore / teacherData.count;
            const teacherPassingRate = (teacherData.passingCount / teacherData.count) * 100;
            
            teacherComparison.push({
              teacherId: teacherData.teacherId,
              teacherName: teacherData.teacherName,
              averageScore: teacherAverage,
              passingRate: teacherPassingRate,
              studentCount: teacherData.count,
              comparedToClassAverage: ((teacherAverage - classAverage) / classAverage) * 100
            });
          }
        }
        
        comparisonData.classData.push({
          class: classData.class,
          section: classData.section,
          averageScore: classAverage,
          passingRate: classPassingRate,
          studentCount: classData.count,
          teacherComparison
        });
      }
    }
    
    res.json(comparisonData);
  } catch (error) {
    console.error('Error comparing performance metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create improvement plan based on data insights
exports.createImprovementPlan = async (req, res) => {
  try {
    const { 
      title,
      description,
      academicYear,
      term,
      subject,
      class: cls,
      section,
      targetAreas,
      strategies,
      resources,
      timeline,
      successCriteria,
      responsibleTeachers
    } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Validate teachers belong to department
    if (responsibleTeachers && responsibleTeachers.length > 0) {
      for (const teacherId of responsibleTeachers) {
        if (!department.teachers.includes(teacherId)) {
          return res.status(400).json({ 
            message: `Teacher with ID ${teacherId} does not belong to your department` 
          });
        }
      }
    }
    
    // Create improvement plan
    const improvementPlan = new ImprovementPlan({
      departmentId: department._id,
      title,
      description,
      academicYear,
      term,
      subject,
      class: cls,
      section,
      targetAreas,
      strategies,
      resources,
      timeline,
      successCriteria,
      responsibleTeachers,
      createdBy: req.user.id,
      status: 'Active'
    });
    
    await improvementPlan.save();
    
    res.status(201).json({ 
      message: 'Improvement plan created successfully', 
      improvementPlan 
    });
  } catch (error) {
    console.error('Error creating improvement plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all improvement plans
exports.getImprovementPlans = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const { status, subject, class: cls } = req.query;
    
    // Build query
    const query = { departmentId: department._id };
    if (status) query.status = status;
    if (subject) query.subject = subject;
    if (cls) query.class = cls;
    
    const improvementPlans = await ImprovementPlan.find(query)
      .populate('responsibleTeachers', 'name email')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(improvementPlans);
  } catch (error) {
    console.error('Error fetching improvement plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};