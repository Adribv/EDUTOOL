const Department = require('../../../models/Staff/HOD/department.model');
const LessonPlan = require('../../../models/Staff/Teacher/lessonplan.model');
const SyllabusProgress = require('../../../models/Staff/HOD/syllabusProgress.model');
const LearningOutcome = require('../../../models/Staff/HOD/learningOutcome.model');
const Staff = require('../../../models/Staff/staffModel');

// Get all lesson plans for review
exports.getLessonPlansForReview = async (req, res) => {
  try {
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
    
    // Get lesson plans submitted by department teachers
    const lessonPlans = await LessonPlan.find({
      createdBy: { $in: teacherIds },
      status: 'Submitted'
    }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    
    res.json(lessonPlans);
  } catch (error) {
    console.error('Error fetching lesson plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Review a lesson plan
exports.reviewLessonPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { status, feedback } = req.body;
    
    const lessonPlan = await LessonPlan.findById(planId);
    
    if (!lessonPlan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(lessonPlan.createdBy)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Update lesson plan status
    lessonPlan.status = status;
    lessonPlan.feedback = feedback;
    lessonPlan.reviewedBy = req.user.id;
    lessonPlan.reviewedAt = new Date();
    
    await lessonPlan.save();
    
    res.json({ message: 'Lesson plan reviewed successfully', lessonPlan });
  } catch (error) {
    console.error('Error reviewing lesson plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get syllabus progress
exports.getSyllabusProgress = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const { subject, class: cls, section } = req.query;
    
    // Build query
    const query = { departmentId: department._id };
    if (subject) query.subject = subject;
    if (cls) query.class = cls;
    if (section) query.section = section;
    
    const progress = await SyllabusProgress.find(query)
      .populate('teacherId', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching syllabus progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track learning outcomes
exports.getLearningOutcomes = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const { subject, class: cls, section } = req.query;
    
    // Build query
    const query = { departmentId: department._id };
    if (subject) query.subject = subject;
    if (cls) query.class = cls;
    if (section) query.section = section;
    
    const outcomes = await LearningOutcome.find(query)
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(outcomes);
  } catch (error) {
    console.error('Error fetching learning outcomes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create improvement plan
exports.createImprovementPlan = async (req, res) => {
  try {
    const { 
      subject, 
      class: cls, 
      section, 
      identifiedIssues, 
      proposedSolutions, 
      timeline, 
      responsibleTeachers 
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
    
    // Check if responsible teachers belong to department
    for (const teacherId of responsibleTeachers) {
      if (!department.teachers.includes(teacherId)) {
        return res.status(400).json({ message: `Teacher ${teacherId} does not belong to your department` });
      }
    }
    
    const improvementPlan = new SyllabusProgress({
      departmentId: department._id,
      subject,
      class: cls,
      section,
      identifiedIssues,
      proposedSolutions,
      timeline,
      responsibleTeachers,
      createdBy: req.user.id,
      status: 'Planned'
    });
    
    await improvementPlan.save();
    
    res.status(201).json({ message: 'Improvement plan created successfully', improvementPlan });
  } catch (error) {
    console.error('Error creating improvement plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create learning outcome
exports.createLearningOutcome = async (req, res) => {
  try {
    const { 
      subject, 
      class: cls, 
      section, 
      outcomeDescription, 
      assessmentCriteria,
      targetDate,
      teacherId
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
    
    // If teacherId is provided, check if teacher belongs to department
    if (teacherId && !department.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher does not belong to your department' });
    }
    
    const learningOutcome = new LearningOutcome({
      departmentId: department._id,
      subject,
      class: cls,
      section,
      outcomeDescription,
      assessmentCriteria,
      targetDate,
      teacherId: teacherId || null,
      status: 'Pending',
      createdBy: req.user.id
    });
    
    await learningOutcome.save();
    
    res.status(201).json({ message: 'Learning outcome created successfully', learningOutcome });
  } catch (error) {
    console.error('Error creating learning outcome:', error);
    res.status(500).json({ message: 'Server error' });
  }
};