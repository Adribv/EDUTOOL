const Student = require('../../models/Student/studentModel');
const LessonPlan = require('../../models/Staff/Teacher/lessonplan.model');

// Get learning resources (lesson plans)
exports.getLearningResources = async (req, res) => {
  try {
    const { subject } = req.query;
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Build query for published lesson plans matching student's class and section
    const query = {
      class: student.class,
      section: student.section,
      status: 'Published',
      isPublished: true
    };
    
    if (subject) {
      query.subject = subject;
    }
    
    const lessonPlans = await LessonPlan.find(query)
      .populate('submittedBy', 'name email')
      .populate('hodApprovedBy', 'name email')
      .populate('principalApprovedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(lessonPlans);
  } catch (error) {
    console.error('Error fetching learning resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get resource details
exports.getResourceDetails = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    const lessonPlan = await LessonPlan.findById(resourceId)
      .populate('submittedBy', 'name email')
      .populate('hodApprovedBy', 'name email')
      .populate('principalApprovedBy', 'name email');
      
    if (!lessonPlan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    
    // Check if lesson plan is published
    if (lessonPlan.status !== 'Published' || !lessonPlan.isPublished) {
      return res.status(403).json({ message: 'This lesson plan is not available' });
    }
    
    // Check if lesson plan is for student's class and section
    const student = await Student.findById(req.user.id);
    if (lessonPlan.class !== student.class || lessonPlan.section !== student.section) {
      return res.status(403).json({ message: 'This lesson plan is not for your class' });
    }
    
    // Increment view count
    lessonPlan.viewCount = (lessonPlan.viewCount || 0) + 1;
    await lessonPlan.save();
    
    res.json(lessonPlan);
  } catch (error) {
    console.error('Error fetching resource details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available subjects for student's class
exports.getAvailableSubjects = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get unique subjects from published lesson plans for student's class and section
    const subjects = await LessonPlan.distinct('subject', {
      class: student.class,
      section: student.section,
      status: 'Published',
      isPublished: true
    });
    
    res.json({ subjects: subjects.sort() });
  } catch (error) {
    console.error('Error fetching available subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};