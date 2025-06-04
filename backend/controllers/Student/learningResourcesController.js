const Student = require('../../models/Student/studentModel');
// Change this:
// const LearningResource = require('../../models/Academic/learningResourceModel');

// To this:
const LearningResource = require('../../models/Staff/Teacher/lessonplan.model');

// Get learning resources
exports.getLearningResources = async (req, res) => {
  try {
    const { subject } = req.query;
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Build query
    const query = {
      class: student.class,
      isPublished: true
    };
    
    if (subject) {
      query.subject = subject;
    }
    
    const resources = await LearningResource.find(query)
      .sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching learning resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get resource details
exports.getResourceDetails = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    const resource = await LearningResource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if resource is published
    if (!resource.isPublished) {
      return res.status(403).json({ message: 'This resource is not available' });
    }
    
    // Check if resource is for student's class
    const student = await Student.findById(req.user.id);
    if (resource.class !== student.class) {
      return res.status(403).json({ message: 'This resource is not for your class' });
    }
    
    // Increment view count
    resource.viewCount = (resource.viewCount || 0) + 1;
    await resource.save();
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};