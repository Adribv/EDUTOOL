const Department = require('../../../models/Staff/HOD/department.model');
const LessonPlan = require('../../../models/Staff/Teacher/lessonplan.model');
const SyllabusProgress = require('../../../models/Staff/HOD/syllabusProgress.model');
const LearningOutcome = require('../../../models/Staff/HOD/learningOutcome.model');
const Staff = require('../../../models/Staff/staffModel');

// Get all lesson plans for review
exports.getLessonPlansForReview = async (req, res) => {
  console.log('🔍 HOD getLessonPlansForReview called');
  console.log('👤 HOD User ID:', req.user.id);
  
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    console.log('🏢 Department found:', department ? department.name : 'No department');
    
    let lessonPlans = [];
    
    if (department) {
      console.log('👥 Department teachers:', department.teachers);
      
      // Get all teachers in department
      const teachers = await Staff.find({ 
        _id: { $in: department.teachers },
        role: 'Teacher'
      }, '_id');
      
      const teacherIds = teachers.map(teacher => teacher._id);
      console.log('👨‍🏫 Teacher IDs in department:', teacherIds);
      
      // Get lesson plans submitted by department teachers
      lessonPlans = await LessonPlan.find({
        submittedBy: { $in: teacherIds },
        status: 'Pending'
      }).populate('submittedBy', 'name email').sort({ createdAt: -1 });
      
      // If no lesson plans found by teacher IDs, try to find by department name
      if (lessonPlans.length === 0) {
        console.log('🔍 No lesson plans found by teacher IDs, trying department name match...');
        
        // Get all teachers with matching department name
        const teachersWithDepartment = await Staff.find({
          'department.name': department.name,
          role: 'Teacher'
        }, '_id');
        
        const teacherIdsByDept = teachersWithDepartment.map(teacher => teacher._id);
        console.log('👨‍🏫 Teachers with matching department name:', teacherIdsByDept);
        
        lessonPlans = await LessonPlan.find({
          submittedBy: { $in: teacherIdsByDept },
          status: 'Pending'
        }).populate('submittedBy', 'name email').sort({ createdAt: -1 });
      }
    }
    
    // If still no lesson plans found, show all pending lesson plans for manual review
    if (lessonPlans.length === 0) {
      console.log('🔍 No lesson plans found by department, showing all pending lesson plans...');
      lessonPlans = await LessonPlan.find({
        status: 'Pending'
      }).populate('submittedBy', 'name email department').sort({ createdAt: -1 });
    }
    
    console.log('📋 Lesson plans found:', lessonPlans.length);
    console.log('📋 Lesson plans:', lessonPlans.map(lp => ({ 
      id: lp._id, 
      title: lp.title, 
      submittedBy: lp.submittedBy?.name,
      department: lp.submittedBy?.department?.name || 'No department'
    })));
    
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
    const { status, feedback, templateData } = req.body;
    
    const lessonPlan = await LessonPlan.findById(planId);
    
    if (!lessonPlan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher belongs to this department (if department exists)
    if (department && !department.teachers.includes(lessonPlan.submittedBy)) {
      console.log('⚠️ Teacher does not belong to HOD department, but allowing review for flexibility');
      // Allow review for flexibility - HOD can review any lesson plan
    }
    
    // If templateData is provided, update the lesson plan with the new template data
    if (templateData) {
      console.log('📝 Updating lesson plan template data');
      lessonPlan.templateData = templateData;
      
      // Also update the main fields if they're in the template data
      if (templateData.title) {
        lessonPlan.title = templateData.title;
      }
      if (templateData.topic) {
        lessonPlan.description = templateData.topic;
      }
      if (templateData.class) {
        lessonPlan.class = templateData.class;
      }
      if (templateData.subject) {
        lessonPlan.subject = templateData.subject;
      }
    }
    
    // If status is provided, process the approval/rejection workflow
    if (status) {
      // Check if lesson plan is in correct status for HOD review
      if (lessonPlan.status !== 'Pending' || lessonPlan.currentApprover !== 'HOD') {
        return res.status(400).json({ message: 'Lesson plan is not ready for HOD review' });
      }
      
      if (status === 'Rejected') {
        // HOD rejected the lesson plan
        lessonPlan.status = 'Rejected';
        lessonPlan.currentApprover = 'Completed';
        lessonPlan.rejectedBy = req.user.id;
        lessonPlan.rejectedAt = new Date();
        lessonPlan.rejectionReason = feedback || 'Rejected by HOD';
      } else if (status === 'HOD_Approved') {
        // HOD approved, forward to Principal
        lessonPlan.status = 'HOD_Approved';
        lessonPlan.currentApprover = 'Principal';
        lessonPlan.hodApprovedBy = req.user.id;
        lessonPlan.hodApprovedAt = new Date();
        lessonPlan.hodFeedback = feedback || 'Approved by HOD';
      } else {
        return res.status(400).json({ message: 'Invalid status for HOD review' });
      }
    }
    
    await lessonPlan.save();
    
    const message = templateData && !status 
      ? 'Template updated successfully' 
      : status === 'Rejected' 
        ? 'Lesson plan rejected' 
        : 'Lesson plan forwarded to Principal for approval';
    
    res.json({ 
      message,
      lessonPlan 
    });
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