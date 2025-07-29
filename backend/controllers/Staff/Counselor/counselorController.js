const Session = require('../../../models/Session');
const Assessment = require('../../../models/Assessment');
const Student = require('../../../models/Student');
const CrisisCase = require('../../../models/CrisisCase');
const Resource = require('../../../models/Resource');

// Session Management Controllers
const getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, studentId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (studentId) query.studentId = studentId;

    const sessions = await Session.find(query)
      .populate('studentId', 'name class')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('studentId', 'name class email');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSession = async (req, res) => {
  try {
    const session = new Session({
      ...req.body,
      counselorId: req.user.id
    });
    
    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Assessment Controllers
const getAllAssessments = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, studentId } = req.query;
    const query = {};

    if (type) query.assessmentType = type;
    if (studentId) query.studentId = studentId;

    const assessments = await Assessment.find(query)
      .populate('studentId', 'name class')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Assessment.countDocuments(query);

    res.json({
      assessments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('studentId', 'name class email');
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAssessment = async (req, res) => {
  try {
    const assessment = new Assessment({
      ...req.body,
      counselorId: req.user.id
    });
    
    const newAssessment = await assessment.save();
    res.status(201).json(newAssessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    res.json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student Management Controllers
const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, class: studentClass } = req.query;
    const query = {};

    if (studentClass) query.class = studentClass;

    const students = await Student.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ studentId: req.params.id })
      .sort({ date: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ studentId: req.params.id })
      .sort({ createdAt: -1 });
    
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Analytics Controllers
const getOverviewAnalytics = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeSessions = await Session.countDocuments({ status: 'Scheduled' });
    const completedSessions = await Session.countDocuments({ status: 'Completed' });
    const pendingSessions = await Session.countDocuments({ status: 'Pending' });
    const highRiskStudents = await Assessment.countDocuments({ 
      score: 'High',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalStudents,
      activeSessions,
      completedSessions,
      pendingSessions,
      highRiskStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSessionAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const sessions = await Session.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssessmentAnalytics = async (req, res) => {
  try {
    const assessments = await Assessment.aggregate([
      {
        $group: {
          _id: "$assessmentType",
          count: { $sum: 1 },
          avgScore: { $avg: { $toInt: "$score" } }
        }
      }
    ]);

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const trends = await Session.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          sessions: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Report Controllers
const generateSessionReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await Session.find(query)
      .populate('studentId', 'name class')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV report
      const csvData = sessions.map(session => ({
        'Session ID': session._id,
        'Student': session.studentId?.name || 'N/A',
        'Class': session.studentId?.class || 'N/A',
        'Type': session.type,
        'Status': session.status,
        'Date': session.date,
        'Notes': session.notes
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sessions-report.csv');
      res.send(csvData);
    } else {
      res.json(sessions);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateAssessmentReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const assessments = await Assessment.find(query)
      .populate('studentId', 'name class')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV report
      const csvData = assessments.map(assessment => ({
        'Assessment ID': assessment._id,
        'Student': assessment.studentId?.name || 'N/A',
        'Class': assessment.studentId?.class || 'N/A',
        'Type': assessment.assessmentType,
        'Score': assessment.score,
        'Date': assessment.createdAt,
        'Notes': assessment.notes
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=assessments-report.csv');
      res.send(csvData);
    } else {
      res.json(assessments);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crisis Management Controllers
const getCrisisCases = async (req, res) => {
  try {
    const crisisCases = await CrisisCase.find()
      .populate('studentId', 'name class')
      .sort({ createdAt: -1 });
    
    res.json(crisisCases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCrisisCase = async (req, res) => {
  try {
    const crisisCase = new CrisisCase({
      ...req.body,
      counselorId: req.user.id
    });
    
    const newCrisisCase = await crisisCase.save();
    res.status(201).json(newCrisisCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCrisisCase = async (req, res) => {
  try {
    const crisisCase = await CrisisCase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!crisisCase) {
      return res.status(404).json({ message: 'Crisis case not found' });
    }
    
    res.json(crisisCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCrisisStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const crisisCase = await CrisisCase.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!crisisCase) {
      return res.status(404).json({ message: 'Crisis case not found' });
    }
    
    res.json(crisisCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Resource Management Controllers
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createResource = async (req, res) => {
  try {
    const resource = new Resource({
      ...req.body,
      counselorId: req.user.id
    });
    
    const newResource = await resource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Session Management
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  updateSessionStatus,
  
  // Assessment Management
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  
  // Student Management
  getAllStudents,
  getStudentById,
  getStudentSessions,
  getStudentAssessments,
  
  // Analytics
  getOverviewAnalytics,
  getSessionAnalytics,
  getAssessmentAnalytics,
  getTrendAnalytics,
  
  // Reports
  generateSessionReport,
  generateAssessmentReport,
  
  // Crisis Management
  getCrisisCases,
  createCrisisCase,
  updateCrisisCase,
  updateCrisisStatus,
  
  // Resource Management
  getResources,
  createResource,
  updateResource,
  deleteResource
}; 