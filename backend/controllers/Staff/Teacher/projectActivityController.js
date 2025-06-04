const Project = require('../../../models/Staff/Teacher/project.model');
const StudentContribution = require('../../../models/Staff/Teacher/studentContribution.model');
const ExtracurricularAchievement = require('../../../models/Staff/Teacher/extracurricularAchievement.model');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, class: className, section, subject, startDate, endDate, evaluationCriteria, groups } = req.body;
    
    const project = new Project({
      title,
      description,
      class: className,
      section,
      subject,
      startDate,
      endDate,
      evaluationCriteria: JSON.parse(evaluationCriteria || '[]'),
      groups: JSON.parse(groups || '[]'),
      createdBy: req.user.id,
      attachmentUrl: req.file ? `/uploads/resources/${req.file.filename}` : null
    });

    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all projects created by the teacher
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get details of a specific project
exports.getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.projectId,
      createdBy: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const { title, description, class: className, section, subject, startDate, endDate, evaluationCriteria, groups, status } = req.body;
    
    const project = await Project.findOne({ 
      _id: req.params.projectId,
      createdBy: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Update project fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (className) project.class = className;
    if (section) project.section = section;
    if (subject) project.subject = subject;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (evaluationCriteria) project.evaluationCriteria = JSON.parse(evaluationCriteria);
    if (groups) project.groups = JSON.parse(groups);
    if (status) project.status = status;
    
    // Update attachment if provided
    if (req.file) {
      project.attachmentUrl = `/uploads/resources/${req.file.filename}`;
    }
    
    await project.save();
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record a student's contribution to a project
exports.recordStudentContribution = async (req, res) => {
  try {
    const { studentId, description, date, evaluationScore, feedback } = req.body;
    
    // Verify project exists and belongs to the teacher
    const project = await Project.findOne({ 
      _id: req.params.projectId,
      createdBy: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const contribution = new StudentContribution({
      projectId: req.params.projectId,
      studentId,
      description,
      date: date || new Date(),
      evaluationScore,
      feedback,
      recordedBy: req.user.id
    });
    
    await contribution.save();
    res.status(201).json({ message: 'Student contribution recorded successfully', contribution });
  } catch (error) {
    console.error('Error recording student contribution:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all student contributions for a project
exports.getStudentContributions = async (req, res) => {
  try {
    // Verify project exists and belongs to the teacher
    const project = await Project.findOne({ 
      _id: req.params.projectId,
      createdBy: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const contributions = await StudentContribution.find({ projectId: req.params.projectId })
      .populate('studentId', 'name rollNumber');
    
    res.json(contributions);
  } catch (error) {
    console.error('Error fetching student contributions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record an extracurricular achievement
exports.recordExtracurricularAchievement = async (req, res) => {
  try {
    const { studentId, title, description, date, category, level, position } = req.body;
    
    const achievement = new ExtracurricularAchievement({
      studentId,
      title,
      description,
      date,
      category,
      level,
      position,
      certificateUrl: req.file ? `/uploads/resources/${req.file.filename}` : null,
      recordedBy: req.user.id
    });
    
    await achievement.save();
    res.status(201).json({ message: 'Extracurricular achievement recorded successfully', achievement });
  } catch (error) {
    console.error('Error recording extracurricular achievement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};