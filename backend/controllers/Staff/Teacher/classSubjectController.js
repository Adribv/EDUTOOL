const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');
const Resource = require('../../../models/Staff/Teacher/resource.model');
const ChapterPlan = require('../../../models/Staff/Teacher/chapterPlan.model');

// Get assigned classes and subjects
exports.getAssignedClasses = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff.assignedSubjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student roster for a class
exports.getStudentRoster = async (req, res) => {
  try {
    const { class: cls, section } = req.params;
    
    // Check if teacher is assigned to this class
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }
    
    const students = await Student.find({ class: cls, section });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create chapter plan
exports.createChapterPlan = async (req, res) => {
  try {
    const { title, description, class: cls, section, subject, startDate, endDate, topics } = req.body;
    
    // Check if teacher is assigned to this class and subject
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class/subject' });
    }
    
    const chapterPlan = new ChapterPlan({
      title,
      description,
      class: cls,
      section,
      subject,
      startDate,
      endDate,
      topics,
      createdBy: req.user.id
    });
    
    await chapterPlan.save();
    res.status(201).json(chapterPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chapter plans for a subject
exports.getChapterPlans = async (req, res) => {
  try {
    const { class: cls, section, subject } = req.params;
    
    const chapterPlans = await ChapterPlan.find({
      class: cls,
      section,
      subject,
      createdBy: req.user.id
    });
    
    res.json(chapterPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};