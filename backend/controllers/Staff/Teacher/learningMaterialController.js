const LessonPlan = require('../../../models/Staff/Teacher/lessonplan.model');
const Resource = require('../../../models/Staff/Teacher/resource.model');
const Staff = require('../../../models/Staff/staffModel');
const path = require('path');
const convertDocxToPdf = require('../../../utils/convertDocxToPdf');

// Submit lesson plan for HOD approval
exports.submitLessonPlan = async (req, res) => {
  try {
    const { title, description, class: cls, section, subject, videoLink } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description' 
      });
    }

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
    const staff = await Staff.findById(req.user.id).populate('department');
    if (!staff) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    let finalSubject = subject;
    let finalClass = cls;
    let finalSection = section;
    let isAssigned = false;

    if (staff.assignedSubjects && staff.assignedSubjects.length > 0) {
      // Check if teacher has specific class/section assignments
      isAssigned = staff.assignedSubjects.some(
        sub => sub.class === cls && sub.section === section && sub.subject === subject
      );
    } else if (staff.department && staff.department.name) {
      // Use department name as subject if no assignedSubjects
      finalSubject = staff.department.name;
      // For department-only mode, use empty class/section or get from assignedClasses if available
      if (!cls && !section && staff.assignedClasses && staff.assignedClasses.length > 0) {
        // Use the first assigned class if available
        finalClass = staff.assignedClasses[0].class || '';
        finalSection = staff.assignedClasses[0].section || '';
      }
      isAssigned = true;
    }

    if (!isAssigned) {
      return res.status(403).json({ 
        message: `You are not assigned to ${subject || (staff.department && staff.department.name) || 'any subject'} for Class ${cls}-${section}. Please contact your HOD for subject assignment.` 
      });
    }
    
    const lessonPlan = new LessonPlan({
      title,
      description,
      fileUrl,
      pdfUrl,
      videoLink,
      videoUrl,
      class: finalClass,
      section: finalSection,
      subject: finalSubject,
      submittedBy: req.user.id,
      status: 'Pending',
      currentApprover: 'HOD'
    });
    
    await lessonPlan.save();
    res.status(201).json({
      message: 'Lesson plan submitted successfully for HOD approval',
      lessonPlan
    });
  } catch (error) {
    console.error('Error submitting lesson plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get lesson plans submitted by teacher
exports.getLessonPlans = async (req, res) => {
  try {
    console.log('🔍 Teacher getLessonPlans called for user:', req.user.id);
    console.log('🔍 User object:', req.user);
    
    // Check if user ID is valid
    if (!req.user.id) {
      console.error('❌ No user ID found in request');
      return res.status(400).json({ message: 'User ID not found' });
    }
    
    // Check if LessonPlan model is available
    if (!LessonPlan) {
      console.error('❌ LessonPlan model not found');
      return res.status(500).json({ message: 'LessonPlan model not available' });
    }
    
    console.log('🔍 Searching for lesson plans with submittedBy:', req.user.id);
    
    const lessonPlans = await LessonPlan.find({ submittedBy: req.user.id })
      .populate('hodApprovedBy', 'name email')
      .populate('principalApprovedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`📋 Found ${lessonPlans.length} lesson plans for teacher`);
    console.log('📋 Lesson plans:', lessonPlans.map(lp => ({ id: lp._id, title: lp.title, status: lp.status })));
    
    res.json(lessonPlans);
  } catch (error) {
    console.error('❌ Error fetching lesson plans:', error);
    console.error('❌ Error stack:', error.stack);
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

// Get available subjects, classes, and sections for lesson plan creation
exports.getLessonPlanOptions = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).populate('department');
    if (!staff) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Get teacher's assigned subjects
    const assignedSubjects = staff.assignedSubjects || [];
    
    if (assignedSubjects.length === 0 && staff.department && staff.department.name) {
      // Use department as subject
      return res.json({
        message: 'Available options for lesson plan creation (department as subject)',
        options: {
          classes: [],
          sections: [],
          subjects: [staff.department.name],
          subjectGroups: [{ class: '', section: '', subjects: [staff.department.name] }],
          assignments: [{ class: '', section: '', subject: staff.department.name }]
        }
      });
    }

    if (assignedSubjects.length === 0) {
      return res.status(403).json({ 
        message: 'You are not assigned to any subjects. Please contact your HOD for subject assignment.',
        options: {
          classes: [],
          sections: [],
          subjects: []
        }
      });
    }

    // Extract unique classes, sections, and subjects from assignments
    const classes = [...new Set(assignedSubjects.map(sub => sub.class))].sort();
    const sections = [...new Set(assignedSubjects.map(sub => sub.section))].sort();
    const subjects = [...new Set(assignedSubjects.map(sub => sub.subject))].sort();

    // Group subjects by class and section for better organization
    const subjectGroups = {};
    assignedSubjects.forEach(assignment => {
      const key = `${assignment.class}-${assignment.section}`;
      if (!subjectGroups[key]) {
        subjectGroups[key] = {
          class: assignment.class,
          section: assignment.section,
          subjects: []
        };
      }
      if (!subjectGroups[key].subjects.includes(assignment.subject)) {
        subjectGroups[key].subjects.push(assignment.subject);
      }
    });

    res.json({
      message: 'Available options for lesson plan creation',
      options: {
        classes,
        sections,
        subjects,
        subjectGroups: Object.values(subjectGroups),
        assignments: assignedSubjects
      }
    });
  } catch (error) {
    console.error('Error getting lesson plan options:', error);
    res.status(500).json({ message: error.message });
  }
};