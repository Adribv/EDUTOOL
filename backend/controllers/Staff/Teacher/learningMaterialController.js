const LessonPlan = require('../../../models/Staff/Teacher/lessonplan.model');
const Resource = require('../../../models/Staff/Teacher/resource.model');
const Staff = require('../../../models/Staff/staffModel');
const path = require('path');
const convertDocxToPdf = require('../../../utils/convertDocxToPdf');

// Submit lesson plan for HOD approval
exports.submitLessonPlan = async (req, res) => {
  try {
    const { title, description, class: cls, section, subject, videoLink } = req.body;

    let fileUrl = '';
    let pdfUrl = '';
    let videoUrl = '';

    if (req.file) {
      if (req.file.mimetype && req.file.mimetype.startsWith('video')) {
        videoUrl = req.file.path;
      } else {
        fileUrl = req.file.path;
        const ext = path.extname(fileUrl).toLowerCase();
        if (ext === '.docx') {
          try {
            pdfUrl = await convertDocxToPdf(fileUrl);
          } catch (err) {
            console.error('Error converting DOCX to PDF:', err);
          }
        } else if (ext === '.pdf') {
          pdfUrl = fileUrl;
        }
      }
    }
    
    // Check if teacher is assigned to this class and subject
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class/subject' });
    }
    
    const lessonPlan = new LessonPlan({
      title,
      description,
      fileUrl,
      pdfUrl,
      videoLink,
      videoUrl,
      class: cls,
      section,
      subject,
      submittedBy: req.user.id,
      status: 'Pending'
    });
    
    await lessonPlan.save();
    res.status(201).json(lessonPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get lesson plans submitted by teacher
exports.getLessonPlans = async (req, res) => {
  try {
    const lessonPlans = await LessonPlan.find({ submittedBy: req.user.id })
      .populate('approvedBy', 'name email');
    
    res.json(lessonPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload teaching resource
exports.uploadResource = async (req, res) => {
  try {
    const { title, description, class: cls, section, subject } = req.body;
    const fileUrl = req.file ? req.file.path : '';
    
    // Check if teacher is assigned to this class and subject
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      sub => sub.class === cls && sub.section === section && sub.subject === subject
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class/subject' });
    }
    
    const resource = new Resource({
      title,
      description,
      fileUrl,
      class: cls,
      section,
      subject,
      uploadedBy: req.user.id
    });
    
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get resources uploaded by teacher
exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user.id });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get departmental resources
exports.getDepartmentalResources = async (req, res) => {
  try {
    // Get teacher's assigned subjects
    const staff = await Staff.findById(req.user.id);
    const assignedSubjects = staff.assignedSubjects.map(sub => sub.subject);
    
    // Get resources for these subjects
    const resources = await Resource.find({ 
      subject: { $in: assignedSubjects } 
    }).populate('uploadedBy', 'name email');
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};