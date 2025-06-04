const TeacherEvaluation = require('../../../models/Staff/HOD/teacherEvaluation.model');
const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');

// Create a new teacher evaluation
exports.createEvaluation = async (req, res) => {
  try {
    const { 
      teacherId, 
      academicYear, 
      term, 
      categories, 
      strengths, 
      areasForImprovement, 
      recommendedTraining, 
      overallRating, 
      overallComments, 
      status 
    } = req.body;
    
    // Verify teacher exists and is a teacher
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(teacherId)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    const evaluation = new TeacherEvaluation({
      teacherId,
      evaluatedBy: req.user.id,
      departmentId: department._id,
      academicYear,
      term,
      categories,
      strengths,
      areasForImprovement,
      recommendedTraining,
      overallRating,
      overallComments,
      status: status || 'Draft'
    });
    
    await evaluation.save();
    res.status(201).json({ message: 'Teacher evaluation created successfully', evaluation });
  } catch (error) {
    console.error('Error creating teacher evaluation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all evaluations for a specific teacher
exports.getTeacherEvaluations = async (req, res) => {
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
    
    const evaluations = await TeacherEvaluation.find({ 
      teacherId,
      departmentId: department._id
    }).sort({ date: -1 });
    
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching teacher evaluations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an evaluation
exports.updateEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { 
      categories, 
      strengths, 
      areasForImprovement, 
      recommendedTraining, 
      overallRating, 
      overallComments, 
      status 
    } = req.body;
    
    const evaluation = await TeacherEvaluation.findById(evaluationId);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Check if HOD created this evaluation
    if (evaluation.evaluatedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this evaluation' });
    }
    
    // Update fields
    if (categories) evaluation.categories = categories;
    if (strengths) evaluation.strengths = strengths;
    if (areasForImprovement) evaluation.areasForImprovement = areasForImprovement;
    if (recommendedTraining) evaluation.recommendedTraining = recommendedTraining;
    if (overallRating) evaluation.overallRating = overallRating;
    if (overallComments) evaluation.overallComments = overallComments;
    if (status) evaluation.status = status;
    
    await evaluation.save();
    res.json({ message: 'Evaluation updated successfully', evaluation });
  } catch (error) {
    console.error('Error updating evaluation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Share evaluation with teacher
exports.shareEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    
    const evaluation = await TeacherEvaluation.findById(evaluationId);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Check if HOD created this evaluation
    if (evaluation.evaluatedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to share this evaluation' });
    }
    
    evaluation.status = 'Shared';
    await evaluation.save();
    
    // Here you would typically send a notification to the teacher
    
    res.json({ message: 'Evaluation shared with teacher successfully', evaluation });
  } catch (error) {
    console.error('Error sharing evaluation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all evaluations created by HOD
exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await TeacherEvaluation.find({ evaluatedBy: req.user.id })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get evaluation by ID
exports.getEvaluationById = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    
    const evaluation = await TeacherEvaluation.findById(evaluationId);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if HOD created this evaluation or if teacher belongs to this department
    if (evaluation.evaluatedBy.toString() !== req.user.id && 
        !department.teachers.includes(evaluation.teacherId)) {
      return res.status(403).json({ message: 'Not authorized to view this evaluation' });
    }
    
    // Populate teacher information
    await evaluation.populate('teacherId', 'name email');
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an evaluation
exports.deleteEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    
    const evaluation = await TeacherEvaluation.findById(evaluationId);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Check if HOD created this evaluation
    if (evaluation.evaluatedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this evaluation' });
    }
    
    // Only allow deletion of draft evaluations
    if (evaluation.status !== 'Draft') {
      return res.status(400).json({ 
        message: 'Only draft evaluations can be deleted. Change status to draft first.' 
      });
    }
    
    await TeacherEvaluation.findByIdAndDelete(evaluationId);
    
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};