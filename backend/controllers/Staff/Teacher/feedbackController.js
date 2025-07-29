const AcademicSuggestion = require('../../../models/Staff/Teacher/academicSuggestion.model');
const ResourceRequest = require('../../../models/Staff/Teacher/resourceRequest.model');
const CurriculumFeedback = require('../../../models/Staff/Teacher/curriculumFeedback.model');

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
    const { 
      subject, 
      class: cls, 
      section, 
      feedbackType, 
      feedback, 
      suggestions, 
      priority, 
      academicYear, 
      term 
    } = req.body;
    
    const curriculumFeedback = new CurriculumFeedback({
      teacherId: req.user.id,
      subject,
      class: cls,
      section,
      feedbackType,
      feedback,
      suggestions,
      priority,
      academicYear,
      term
    });
    
    await curriculumFeedback.save();
    res.status(201).json({ 
      message: 'Curriculum feedback submitted successfully', 
      curriculumFeedback 
    });
  } catch (error) {
    console.error('Error submitting curriculum feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all curriculum feedback provided by the teacher
exports.getCurriculumFeedback = async (req, res) => {
  try {
    const feedback = await CurriculumFeedback.find({ teacherId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching curriculum feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};