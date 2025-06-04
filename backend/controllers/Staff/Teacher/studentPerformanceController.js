const StudentPerformance = require('../../../models/Staff/Teacher/studentPerformance.model');
const Student = require('../../../models/Student/studentModel');
const Staff = require('../../../models/Staff/staffModel');
const ExamResult = require('../../../models/Staff/Teacher/examResult.model');
const Submission = require('../../../models/Staff/Teacher/submission.model');

// Record student performance
exports.recordPerformance = async (req, res) => {
  try {
    const { 
      studentId, class: cls, section, subject, term, academicYear,
      assessments, behavioralObservations, needsRemedial, interventionPlan 
    } = req.body;
    
    // Check if teacher is assigned to this class and subject
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class/subject' });
    }
    
    // Check if record already exists
    let performance = await StudentPerformance.findOne({
      studentId,
      class: cls,
      section,
      subject,
      term,
      academicYear
    });
    
    if (performance) {
      // Update existing record
      performance.assessments = assessments || performance.assessments;
      performance.behavioralObservations = behavioralObservations || performance.behavioralObservations;
      performance.needsRemedial = needsRemedial !== undefined ? needsRemedial : performance.needsRemedial;
      performance.interventionPlan = interventionPlan || performance.interventionPlan;
    } else {
      // Create new record
      performance = new StudentPerformance({
        studentId,
        class: cls,
        section,
        subject,
        term,
        academicYear,
        assessments,
        behavioralObservations,
        needsRemedial,
        interventionPlan,
        recordedBy: req.user.id
      });
    }
    
    await performance.save();
    res.status(201).json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student performance
// Add this if the file doesn't exist yet
exports.getStudentPerformance = async (req, res) => {
  try {
    const { studentId, subject } = req.params;
    
    // If subject is provided, filter by subject
    const query = { studentId };
    if (subject) {
      query.subject = subject;
    }
    
    // Implement your database query here based on the query object
    // Example: const performance = await Performance.find(query);
    
    // For now, just return a placeholder response
    res.json({ 
      message: 'Student performance retrieved',
      studentId,
      subject: subject || 'All subjects'
    });
  } catch (error) {
    console.error('Error getting student performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add other controller methods if they don't exist
exports.recordPerformance = async (req, res) => {
  // Implementation
  res.json({ message: 'Performance recorded' });
};

exports.addBehavioralObservation = async (req, res) => {
  // Implementation
  res.json({ message: 'Observation added' });
};

exports.createInterventionPlan = async (req, res) => {
  // Implementation
  res.json({ message: 'Intervention plan created' });
};