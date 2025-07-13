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
    
    console.log(`🔍 Student: ${student.name} (${student.email})`);
    console.log(`📚 Student class: ${student.class}, section: ${student.section}`);
    
    // Build query for published lesson plans matching student's class and section
    // Handle different class formats (e.g., "12" vs "Class 12")
    const studentClass = student.class;
    const studentSection = student.section;
    
    // Create flexible class matching
    const classMatches = [
      studentClass,
      studentClass.replace('Class ', ''),
      `Class ${studentClass}`,
      studentClass.toString()
    ];
    
    const query = {
      class: { $in: classMatches },
      section: studentSection,
      status: 'Published',
      isPublished: true
    };
    
    if (subject) {
      query.subject = subject;
    }
    
    console.log(`🔍 Query for lesson plans:`, query);
    
    const lessonPlans = await LessonPlan.find(query)
      .populate('submittedBy', 'name email')
      .populate('hodApprovedBy', 'name email')
      .populate('principalApprovedBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`📋 Found ${lessonPlans.length} lesson plans for student`);
    lessonPlans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.title} (${plan.class}-${plan.section}, ${plan.subject})`);
    });
    
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
    
    // Handle different class formats (e.g., "12" vs "Class 12")
    const studentClass = student.class;
    const classMatches = [
      studentClass,
      studentClass.replace('Class ', ''),
      `Class ${studentClass}`,
      studentClass.toString()
    ];
    
    if (!classMatches.includes(lessonPlan.class) || lessonPlan.section !== student.section) {
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
    // Handle different class formats (e.g., "12" vs "Class 12")
    const studentClass = student.class;
    const classMatches = [
      studentClass,
      studentClass.replace('Class ', ''),
      `Class ${studentClass}`,
      studentClass.toString()
    ];
    
    const subjects = await LessonPlan.distinct('subject', {
      class: { $in: classMatches },
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