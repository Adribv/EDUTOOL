const ComprehensiveProgressReport = require('../../models/Student/comprehensiveProgressReportModel');
const Student = require('../../models/Student/studentModel');
const Staff = require('../../models/Staff/staffModel');
const Attendance = require('../../models/Staff/Teacher/attendance.model');
const Assignment = require('../../models/Staff/Teacher/assignment.model');
const Exam = require('../../models/Staff/Teacher/exam.model');
// const ExamResult = require('../../models/Staff/Teacher/examResultModel');
const DisciplinaryForm = require('../../models/disciplinaryForm.model');
const FeePayment = require('../../models/Finance/feePaymentModel');
const HealthRecord = require('../../models/Student/healthRecordModel');

// Generate comprehensive progress report with auto-integrated data
exports.generateComprehensiveReport = async (req, res) => {
  try {
    const { studentId, academicYear, reportPeriod } = req.body;
    const generatedBy = req.user.id;

    // Get student information
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Auto-populate data from various sources
    const reportData = await populateReportData(studentId, academicYear, reportPeriod);

    // Create comprehensive report
    const comprehensiveReport = new ComprehensiveProgressReport({
      studentId,
      academicYear,
      class: student.class,
      section: student.section,
      reportPeriod,
      generatedBy,
      ...reportData
    });

    await comprehensiveReport.save();

    const populatedReport = await ComprehensiveProgressReport.findById(comprehensiveReport._id)
      .populate('studentId', 'name rollNumber class section')
      .populate('generatedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedReport,
      message: 'Comprehensive progress report generated successfully'
    });
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating comprehensive report'
    });
  }
};

// Get comprehensive report for current student
exports.getMyComprehensiveReport = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academicYear, reportPeriod } = req.query;

    const query = { studentId };
    if (academicYear) query.academicYear = academicYear;
    if (reportPeriod) query.reportPeriod = reportPeriod;

    const reports = await ComprehensiveProgressReport.find(query)
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching comprehensive report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comprehensive report'
    });
  }
};

// Get child's comprehensive report (for parents)
exports.getChildComprehensiveReport = async (req, res) => {
  try {
    const { childId } = req.params;
    const { academicYear, reportPeriod } = req.query;

    // Verify parent has access to this child
    const parentId = req.user.id;
    const student = await Student.findOne({ _id: childId, parentId });
    
    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this student'
      });
    }

    const query = { studentId: childId };
    if (academicYear) query.academicYear = academicYear;
    if (reportPeriod) query.reportPeriod = reportPeriod;

    const reports = await ComprehensiveProgressReport.find(query)
      .populate('studentId', 'name rollNumber class section')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching child comprehensive report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching child comprehensive report'
    });
  }
};

// Get comprehensive report by ID
exports.getComprehensiveReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await ComprehensiveProgressReport.findById(id)
      .populate('studentId', 'name rollNumber class section')
      .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Comprehensive report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching comprehensive report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comprehensive report'
    });
  }
};

// Update comprehensive report
exports.updateComprehensiveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      generatedBy: req.user.id
    };

    const report = await ComprehensiveProgressReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('studentId', 'name rollNumber class section')
     .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Comprehensive report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Comprehensive report updated successfully'
    });
  } catch (error) {
    console.error('Error updating comprehensive report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comprehensive report'
    });
  }
};

// Submit feedback for comprehensive report
exports.submitComprehensiveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentComments, studentComments } = req.body;

    const report = await ComprehensiveProgressReport.findByIdAndUpdate(
      id,
      {
        'feedback.parentComments': parentComments,
        'feedback.studentComments': studentComments,
        'feedback.acknowledgmentDate': new Date()
      },
      { new: true }
    ).populate('studentId', 'name rollNumber class section');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Comprehensive report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
};

// Helper function to populate report data from various sources
async function populateReportData(studentId, academicYear, reportPeriod) {
  const startDate = getStartDate(reportPeriod);
  const endDate = new Date();

  // Get attendance data
  const attendanceData = await getAttendanceData(studentId, startDate, endDate);

  // Get assignment data
  const assignmentData = await getAssignmentData(studentId, startDate, endDate);

  // Get exam data
  const examData = await getExamData(studentId, academicYear);

  // Get behavioral data
  const behaviorData = await getBehaviorData(studentId, startDate, endDate);

  // Get fee data
  const feeData = await getFeeData(studentId, academicYear);

  // Get health data
  const healthData = await getHealthData(studentId);

  // Calculate trends and recommendations
  const trends = calculateTrends(attendanceData, assignmentData, examData, behaviorData);
  const recommendations = generateRecommendations(attendanceData, assignmentData, examData, behaviorData);

  return {
    attendance: attendanceData,
    assignmentPerformance: assignmentData,
    examPerformance: examData,
    behavior: behaviorData,
    feeStatus: feeData,
    healthInfo: healthData,
    trends,
    recommendations,
    dataSources: {
      attendance: { lastUpdated: new Date(), source: 'Attendance Module' },
      exams: { lastUpdated: new Date(), source: 'Exam Module' },
      assignments: { lastUpdated: new Date(), source: 'Assignment Module' },
      behavior: { lastUpdated: new Date(), source: 'Disciplinary Module' },
      activities: { lastUpdated: new Date(), source: 'Activities Module' },
      fees: { lastUpdated: new Date(), source: 'Fee Module' },
      health: { lastUpdated: new Date(), source: 'Health Module' }
    }
  };
}

// Helper function to get attendance data
async function getAttendanceData(studentId, startDate, endDate) {
  const attendanceRecords = await Attendance.find({
    studentId,
    date: { $gte: startDate, $lte: endDate }
  });

  const totalDays = attendanceRecords.length;
  const daysPresent = attendanceRecords.filter(record => record.status === 'Present').length;
  const daysAbsent = attendanceRecords.filter(record => record.status === 'Absent').length;
  const lateArrivals = attendanceRecords.filter(record => record.lateArrival).length;
  const earlyDepartures = attendanceRecords.filter(record => record.earlyDeparture).length;

  // Calculate monthly breakdown
  const monthlyBreakdown = [];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];

  months.forEach((month, index) => {
    const monthRecords = attendanceRecords.filter(record => 
      new Date(record.date).getMonth() === index
    );
    
    if (monthRecords.length > 0) {
      const present = monthRecords.filter(record => record.status === 'Present').length;
      const absent = monthRecords.filter(record => record.status === 'Absent').length;
      const percentage = Math.round((present / monthRecords.length) * 100);
      
      monthlyBreakdown.push({
        month,
        present,
        absent,
        percentage
      });
    }
  });

  return {
    totalDays,
    daysPresent,
    daysAbsent,
    percentage: totalDays > 0 ? Math.round((daysPresent / totalDays) * 100) : 0,
    lateArrivals,
    earlyDepartures,
    monthlyBreakdown
  };
}

// Helper function to get assignment data
async function getAssignmentData(studentId, startDate, endDate) {
  const assignments = await Assignment.find({
    assignedTo: studentId,
    dueDate: { $gte: startDate, $lte: endDate }
  }).populate('submissions');

  const totalAssignments = assignments.length;
  const submittedAssignments = assignments.filter(assignment => 
    assignment.submissions && assignment.submissions.length > 0
  ).length;
  const pendingAssignments = totalAssignments - submittedAssignments;

  // Calculate average score
  let totalScore = 0;
  let scoredAssignments = 0;
  const assignmentDetails = [];

  assignments.forEach(assignment => {
    const submission = assignment.submissions && assignment.submissions[0];
    const status = submission ? 'Submitted' : 'Not Submitted';
    const score = submission ? submission.score : 0;
    const maxScore = assignment.maxScore || 100;

    if (submission) {
      totalScore += score;
      scoredAssignments++;
    }

    assignmentDetails.push({
      subject: assignment.subject,
      title: assignment.title,
      dueDate: assignment.dueDate,
      submittedDate: submission ? submission.submittedAt : null,
      score,
      maxScore,
      status: submission ? (submission.submittedAt > assignment.dueDate ? 'Late' : 'Submitted') : 'Not Submitted',
      teacherFeedback: submission ? submission.feedback : ''
    });
  });

  const averageScore = scoredAssignments > 0 ? Math.round(totalScore / scoredAssignments) : 0;

  return {
    totalAssignments,
    submittedAssignments,
    pendingAssignments,
    averageScore,
    assignments: assignmentDetails
  };
}

// Helper function to get exam data
async function getExamData(studentId, academicYear) {
  const examResults = await ExamResult.find({
    studentId,
    academicYear
  }).populate('examId');

  const totalExams = examResults.length;
  let totalScore = 0;
  let highestScore = 0;
  let lowestScore = 100;
  const examDetails = [];

  examResults.forEach(result => {
    const percentage = Math.round((result.marks / result.totalMarks) * 100);
    totalScore += percentage;
    
    if (percentage > highestScore) highestScore = percentage;
    if (percentage < lowestScore) lowestScore = percentage;

    examDetails.push({
      examName: result.examId ? result.examId.name : 'Unknown',
      examType: result.examId ? result.examId.examType : 'Unknown',
      subject: result.subject,
      examDate: result.examId ? result.examId.examDate : new Date(),
      score: result.marks,
      maxScore: result.totalMarks,
      percentage,
      grade: getGradeFromPercentage(percentage),
      rank: result.rank || 0,
      totalStudents: result.totalStudents || 0
    });
  });

  const averageScore = totalExams > 0 ? Math.round(totalScore / totalExams) : 0;

  return {
    totalExams,
    averageScore,
    highestScore,
    lowestScore,
    exams: examDetails
  };
}

// Helper function to get behavioral data
async function getBehaviorData(studentId, startDate, endDate) {
  const disciplinaryRecords = await DisciplinaryForm.find({
    studentId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Calculate behavior rating based on incidents
  let behaviorRating = 'Excellent';
  if (disciplinaryRecords.length > 0) {
    const majorIncidents = disciplinaryRecords.filter(record => record.severity === 'Major').length;
    const moderateIncidents = disciplinaryRecords.filter(record => record.severity === 'Moderate').length;
    
    if (majorIncidents > 0) behaviorRating = 'Poor';
    else if (moderateIncidents > 2) behaviorRating = 'Needs Improvement';
    else if (moderateIncidents > 0) behaviorRating = 'Satisfactory';
    else if (disciplinaryRecords.length > 0) behaviorRating = 'Good';
  }

  const incidents = disciplinaryRecords.map(record => ({
    date: record.createdAt,
    type: record.incidentType,
    description: record.description,
    severity: record.severity,
    actionTaken: record.actionTaken,
    resolved: record.status === 'Resolved'
  }));

  return {
    overallRating: behaviorRating,
    punctuality: 'Good', // Default - can be enhanced with attendance data
    discipline: behaviorRating,
    participation: 'Good', // Default - can be enhanced with activity data
    teamwork: 'Good', // Default - can be enhanced with group activity data
    leadership: 'Good', // Default - can be enhanced with leadership activity data
    remarks: disciplinaryRecords.length > 0 ? 'Some behavioral incidents noted' : 'Good behavior maintained',
    disciplinaryIncidents: incidents
  };
}

// Helper function to get fee data
async function getFeeData(studentId, academicYear) {
  const feePayments = await FeePayment.find({
    studentId,
    academicYear
  });

  const totalFees = feePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = feePayments.filter(payment => payment.status === 'Paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = totalFees - paidAmount;

  let paymentStatus = 'Paid';
  if (pendingAmount > 0) {
    const overduePayments = feePayments.filter(payment => 
      payment.status === 'Pending' && new Date(payment.dueDate) < new Date()
    );
    paymentStatus = overduePayments.length > 0 ? 'Overdue' : 'Partial';
  }

  const paymentHistory = feePayments.map(payment => ({
    date: payment.paymentDate,
    amount: payment.amount,
    method: payment.paymentMethod,
    receipt: payment.receiptNumber
  }));

  return {
    totalFees,
    paidAmount,
    pendingAmount,
    paymentStatus,
    lastPaymentDate: paymentHistory.length > 0 ? paymentHistory[0].date : null,
    nextDueDate: feePayments.find(p => p.status === 'Pending')?.dueDate || null,
    paymentHistory
  };
}

// Helper function to get health data
async function getHealthData(studentId) {
  const healthRecord = await HealthRecord.findOne({ studentId });
  
  if (!healthRecord) {
    return {
      height: 0,
      weight: 0,
      bmi: 0,
      bloodGroup: 'Unknown',
      allergies: [],
      medicalConditions: [],
      lastCheckup: null,
      healthIncidents: []
    };
  }

  const bmi = healthRecord.weight && healthRecord.height ? 
    Math.round((healthRecord.weight / Math.pow(healthRecord.height / 100, 2)) * 100) / 100 : 0;

  return {
    height: healthRecord.height || 0,
    weight: healthRecord.weight || 0,
    bmi,
    bloodGroup: healthRecord.bloodGroup || 'Unknown',
    allergies: healthRecord.allergies || [],
    medicalConditions: healthRecord.medicalConditions || [],
    lastCheckup: healthRecord.lastCheckup,
    healthIncidents: healthRecord.healthIncidents || []
  };
}

// Helper function to calculate trends
function calculateTrends(attendanceData, assignmentData, examData, behaviorData) {
  return {
    academicProgress: examData.averageScore >= 75 ? 'Improving' : 
                     examData.averageScore >= 60 ? 'Stable' : 'Declining',
    attendanceTrend: attendanceData.percentage >= 90 ? 'Improving' : 
                    attendanceData.percentage >= 75 ? 'Stable' : 'Declining',
    behaviorTrend: behaviorData.overallRating === 'Excellent' || behaviorData.overallRating === 'Good' ? 'Improving' :
                  behaviorData.overallRating === 'Satisfactory' ? 'Stable' : 'Declining',
    assignmentTrend: assignmentData.averageScore >= 75 ? 'Improving' :
                    assignmentData.averageScore >= 60 ? 'Stable' : 'Declining'
  };
}

// Helper function to generate recommendations
function generateRecommendations(attendanceData, assignmentData, examData, behaviorData) {
  const recommendations = {
    academic: [],
    behavioral: [],
    coCurricular: [],
    health: [],
    general: []
  };

  // Academic recommendations
  if (examData.averageScore < 75) {
    recommendations.academic.push('Focus on improving academic performance through regular study and practice');
  }
  if (assignmentData.pendingAssignments > 0) {
    recommendations.academic.push('Complete pending assignments to improve overall performance');
  }

  // Attendance recommendations
  if (attendanceData.percentage < 90) {
    recommendations.behavioral.push('Improve attendance to maintain academic progress');
  }

  // Behavioral recommendations
  if (behaviorData.overallRating === 'Needs Improvement' || behaviorData.overallRating === 'Poor') {
    recommendations.behavioral.push('Work on improving behavioral aspects and classroom conduct');
  }

  // General recommendations
  if (examData.averageScore < 60) {
    recommendations.general.push('Consider seeking additional academic support or tutoring');
  }

  return recommendations;
}

// Helper function to get start date based on report period
function getStartDate(reportPeriod) {
  const now = new Date();
  switch (reportPeriod) {
    case 'Monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'Quarterly':
      return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    case 'Half-Yearly':
      return new Date(now.getFullYear(), now.getMonth() < 6 ? 0 : 6, 1);
    case 'Annual':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), 0, 1);
  }
}

// Helper function to get grade from percentage
function getGradeFromPercentage(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 30) return 'D';
  return 'F';
} 