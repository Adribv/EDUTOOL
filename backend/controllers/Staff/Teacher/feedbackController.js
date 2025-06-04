const AcademicSuggestion = require('../../../models/Staff/Teacher/academicSuggestion.model');
const ResourceRequest = require('../../../models/Staff/Teacher/resourceRequest.model');

// Submit an academic suggestion
exports.submitSuggestion = async (req, res) => {
  try {
    const { title, description, category, targetAudience } = req.body;
    
    const suggestion = new AcademicSuggestion({
      teacherId: req.user.id,
      title,
      description,
      category,
      targetAudience
    });
    
    await suggestion.save();
    res.status(201).json({ message: 'Academic suggestion submitted successfully', suggestion });
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request a resource
exports.requestResource = async (req, res) => {
  try {
    const { title, description, resourceType, purpose, targetDate, estimatedCost } = req.body;
    
    const request = new ResourceRequest({
      teacherId: req.user.id,
      title,
      description,
      resourceType,
      purpose,
      targetDate,
      estimatedCost
    });
    
    await request.save();
    res.status(201).json({ message: 'Resource request submitted successfully', request });
  } catch (error) {
    console.error('Error submitting resource request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all resource requests made by the teacher
exports.getResourceRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ teacherId: req.user.id });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching resource requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Provide feedback on curriculum
exports.provideCurriculumFeedback = async (req, res) => {
  try {
    const { title, description, category, targetAudience } = req.body;
    
    const feedback = new AcademicSuggestion({
      teacherId: req.user.id,
      title,
      description,
      category,
      targetAudience
    });
    
    await feedback.save();
    res.status(201).json({ message: 'Curriculum feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting curriculum feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all curriculum feedback provided by the teacher
exports.getCurriculumFeedback = async (req, res) => {
  try {
    const feedback = await AcademicSuggestion.find({ 
      teacherId: req.user.id,
      category: 'Curriculum'
    });
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching curriculum feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};