const StudentProgress = require('../../models/Student/studentProgressModel');
const Student = require('../../models/Student/studentModel');
const Staff = require('../../models/Staff/staffModel');

// Get student progress by student ID
exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, assessmentPeriod } = req.query;

    const query = { studentId };
    if (academicYear) query.academicYear = academicYear;
    if (assessmentPeriod) query.assessmentPeriod = assessmentPeriod;

    const progress = await StudentProgress.find(query)
      .populate('studentId', 'name rollNumber class section')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student progress'
    });
  }
};

// Get current student's progress
exports.getMyProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academicYear, assessmentPeriod } = req.query;

    const query = { studentId };
    if (academicYear) query.academicYear = academicYear;
    if (assessmentPeriod) query.assessmentPeriod = assessmentPeriod;

    const progress = await StudentProgress.find(query)
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching my progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress data'
    });
  }
};

// Get child's progress (for parents)
exports.getChildProgress = async (req, res) => {
  try {
    const { childId } = req.params;
    const { academicYear, assessmentPeriod } = req.query;

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
    if (assessmentPeriod) query.assessmentPeriod = assessmentPeriod;

    const progress = await StudentProgress.find(query)
      .populate('studentId', 'name rollNumber class section')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching child progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching child progress'
    });
  }
};

// Create new progress report
exports.createProgressReport = async (req, res) => {
  try {
    const progressData = {
      ...req.body,
      generatedBy: req.user.id
    };

    const progress = new StudentProgress(progressData);
    await progress.save();

    const populatedProgress = await StudentProgress.findById(progress._id)
      .populate('studentId', 'name rollNumber class section')
      .populate('generatedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedProgress,
      message: 'Progress report created successfully'
    });
  } catch (error) {
    console.error('Error creating progress report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating progress report'
    });
  }
};

// Update progress report
exports.updateProgressReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      generatedBy: req.user.id
    };

    const progress = await StudentProgress.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('studentId', 'name rollNumber class section')
     .populate('generatedBy', 'name email');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    res.json({
      success: true,
      data: progress,
      message: 'Progress report updated successfully'
    });
  } catch (error) {
    console.error('Error updating progress report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress report'
    });
  }
};

// Delete progress report
exports.deleteProgressReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const progress = await StudentProgress.findByIdAndDelete(id);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    res.json({
      success: true,
      message: 'Progress report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting progress report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting progress report'
    });
  }
};

// Get progress analytics
exports.getProgressAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    const query = { studentId };
    if (academicYear) query.academicYear = academicYear;

    const progressReports = await StudentProgress.find(query)
      .sort({ createdAt: 1 });

    // Calculate trends
    const analytics = {
      academicTrend: calculateTrend(progressReports, 'academicPerformance.overallPercentage'),
      attendanceTrend: calculateTrend(progressReports, 'attendance.percentage'),
      behaviorTrend: calculateBehaviorTrend(progressReports),
      subjectPerformance: calculateSubjectPerformance(progressReports),
      skillsDevelopment: calculateSkillsDevelopment(progressReports),
      recommendations: generateRecommendations(progressReports)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching progress analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress analytics'
    });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentComments, studentComments } = req.body;

    const progress = await StudentProgress.findByIdAndUpdate(
      id,
      {
        'feedback.parentComments': parentComments,
        'feedback.studentComments': studentComments,
        'feedback.acknowledgmentDate': new Date()
      },
      { new: true }
    ).populate('studentId', 'name rollNumber class section');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    res.json({
      success: true,
      data: progress,
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

// Helper functions for analytics
function calculateTrend(reports, field) {
  if (reports.length < 2) return 'Stable';
  
  const values = reports.map(report => {
    const fieldParts = field.split('.');
    let value = report;
    for (const part of fieldParts) {
      value = value[part];
    }
    return value;
  });

  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  
  if (lastValue > firstValue) return 'Improving';
  if (lastValue < firstValue) return 'Declining';
  return 'Stable';
}

function calculateBehaviorTrend(reports) {
  if (reports.length < 2) return 'Stable';
  
  const behaviorRatings = {
    'Excellent': 5,
    'Good': 4,
    'Satisfactory': 3,
    'Needs Improvement': 2,
    'Poor': 1
  };

  const firstRating = behaviorRatings[reports[0].behavior.overallRating] || 3;
  const lastRating = behaviorRatings[reports[reports.length - 1].behavior.overallRating] || 3;
  
  if (lastRating > firstRating) return 'Improving';
  if (lastRating < firstRating) return 'Declining';
  return 'Stable';
}

function calculateSubjectPerformance(reports) {
  if (reports.length === 0) return {};

  const latestReport = reports[reports.length - 1];
  const subjects = latestReport.academicPerformance.subjects || [];

  return subjects.reduce((acc, subject) => {
    acc[subject.name] = {
      grade: subject.grade,
      percentage: subject.percentage,
      improvement: subject.improvement,
      remarks: subject.teacherRemarks
    };
    return acc;
  }, {});
}

function calculateSkillsDevelopment(reports) {
  if (reports.length === 0) return {};

  const latestReport = reports[reports.length - 1];
  const skills = latestReport.skills || {};

  const skillRatings = {
    'Excellent': 5,
    'Good': 4,
    'Satisfactory': 3,
    'Needs Improvement': 2,
    'Poor': 1
  };

  return Object.keys(skills).reduce((acc, skill) => {
    acc[skill] = {
      rating: skills[skill],
      score: skillRatings[skills[skill]] || 3
    };
    return acc;
  }, {});
}

function generateRecommendations(reports) {
  if (reports.length === 0) return [];

  const latestReport = reports[reports.length - 1];
  const recommendations = [];

  // Academic recommendations
  if (latestReport.academicPerformance.overallPercentage < 75) {
    recommendations.push('Focus on improving academic performance through regular study and practice');
  }

  // Attendance recommendations
  if (latestReport.attendance.percentage < 90) {
    recommendations.push('Improve attendance to maintain academic progress');
  }

  // Behavioral recommendations
  if (latestReport.behavior.overallRating === 'Needs Improvement' || latestReport.behavior.overallRating === 'Poor') {
    recommendations.push('Work on improving behavioral aspects and classroom conduct');
  }

  // Skills recommendations
  const skills = latestReport.skills || {};
  Object.keys(skills).forEach(skill => {
    if (skills[skill] === 'Needs Improvement' || skills[skill] === 'Poor') {
      recommendations.push(`Focus on developing ${skill.toLowerCase()} skills`);
    }
  });

  return recommendations;
} 