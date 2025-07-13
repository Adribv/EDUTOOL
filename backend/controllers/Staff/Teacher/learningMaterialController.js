const LessonPlan = require('../../../models/Staff/Teacher/lessonplan.model');
const Resource = require('../../../models/Staff/Teacher/resource.model');
const Staff = require('../../../models/Staff/staffModel');
const path = require('path');
const convertDocxToPdf = require('../../../utils/convertDocxToPdf');

// Submit lesson plan for HOD approval
exports.submitLessonPlan = async (req, res) => {
  try {
    console.log('🚀 Lesson plan submission started');
    console.log('📋 Request body:', req.body);
    console.log('📁 Uploaded file:', req.file);
    
    const { title, description, class: cls, section, subject, videoLink } = req.body;

    // Validate required fields
    if (!title || !description) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields: title, description' 
      });
    }

    let fileUrl = '';
    let pdfUrl = '';
    let videoUrl = '';

    // --- File upload logic ---
    if (req.file) {
      console.log('✅ File uploaded successfully:', req.file.originalname);
      console.log('📁 File saved to:', req.file.path);
      
      const ext = path.extname(req.file.path).toLowerCase();
      // Convert Windows backslashes to forward slashes for web URLs
      fileUrl = req.file.path.replace(/\\/g, '/'); // Always set fileUrl for any file
      
      if (req.file.mimetype && req.file.mimetype.startsWith('video')) {
        videoUrl = req.file.path.replace(/\\/g, '/');
      } else if (ext === '.pdf') {
        pdfUrl = req.file.path.replace(/\\/g, '/'); // Set pdfUrl for PDF files
      } else if (['.doc', '.docx'].includes(ext)) {
        // Try to convert DOC/DOCX to PDF, but don't fail if conversion fails
        try {
          const pdfPath = await convertDocxToPdf(req.file.path);
          if (pdfPath) {
            pdfUrl = pdfPath.replace(/\\/g, '/');
            console.log('✅ PDF conversion successful:', pdfUrl);
          }
        } catch (conversionError) {
          console.log('⚠️ PDF conversion failed (LibreOffice not installed), but file upload succeeded');
          console.log('📄 Original file is still accessible:', fileUrl);
          // Don't throw error - the original file is still saved and usable
        }
      }
    } else {
      console.log('⚠️ No file uploaded');
    }
    // --- End file upload logic ---
    
    // Check if teacher is assigned to this class and subject
    const staff = await Staff.findById(req.user.id)
      .populate('department')
      .populate({ path: 'coordinator', model: 'Class' });
    if (!staff) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    let finalSubject = subject;
    let finalClass = cls;
    let finalSection = section;
    let isAssigned = false;

    // First, try to use teacher's assigned subjects
    if (staff.assignedSubjects && staff.assignedSubjects.length > 0) {
      // Check if teacher has specific class/section assignments
      isAssigned = staff.assignedSubjects.some(
        sub => sub.class === cls && sub.section === section && sub.subject === subject
      );
      
      if (isAssigned) {
        finalClass = cls;
        finalSection = section;
        finalSubject = subject;
      }
    }
    
    // If no assigned subjects or not assigned to this specific class/subject, use assigned classes
    if (!isAssigned && staff.assignedClasses && staff.assignedClasses.length > 0) {
      // Use the first assigned class automatically
      finalClass = staff.assignedClasses[0].class;
      finalSection = staff.assignedClasses[0].section;
      // Use department name as subject if no assignedSubjects, otherwise use the provided subject
      if (!staff.assignedSubjects || staff.assignedSubjects.length === 0) {
        finalSubject = staff.department ? staff.department.name : subject;
      }
      isAssigned = true;
      console.log(`📚 Using teacher's assigned class: ${finalClass}-${finalSection}, subject: ${finalSubject}`);
    }

    // If still not assigned, use coordinated classes (coordinator field)
    if (!isAssigned && staff.coordinator && staff.coordinator.length > 0) {
      // staff.coordinator is an array of Class objects
      const firstCoordClass = Array.isArray(staff.coordinator) ? staff.coordinator[0] : staff.coordinator;
      if (firstCoordClass) {
        // Use the full class name (e.g., "12C") instead of just grade
        finalClass = firstCoordClass.name || firstCoordClass.grade || '';
        finalSection = firstCoordClass.section || '';
        // Use department name as subject if available
        finalSubject = staff.department && staff.department.name ? staff.department.name : subject;
        isAssigned = true;
        console.log(`📚 Using teacher's coordinated class: ${finalClass}-${finalSection}, subject: ${finalSubject}`);
      }
    }

    // If still not assigned and has department, use department as subject
    if (!isAssigned && staff.department && staff.department.name) {
      finalSubject = staff.department.name;
      // Try to get class/section from assignedClasses or use provided values
      if (staff.assignedClasses && staff.assignedClasses.length > 0) {
        finalClass = staff.assignedClasses[0].class;
        finalSection = staff.assignedClasses[0].section;
      } else {
        finalClass = cls || '';
        finalSection = section || '';
      }
      isAssigned = true;
    }

    if (!isAssigned) {
      return res.status(403).json({ 
        message: `You are not assigned to any classes or subjects. Please contact your HOD for class/subject assignment.` 
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
    const staff = await Staff.findById(req.user.id)
      .populate('department')
      .populate({ path: 'coordinator', model: 'Class' });
    if (!staff) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Get teacher's assigned subjects and classes
    const assignedSubjects = staff.assignedSubjects || [];
    const assignedClasses = staff.assignedClasses || [];
    const coordinatedClasses = staff.coordinator || [];
    
    console.log(`👨‍🏫 Teacher: ${staff.name}`);
    console.log(`📚 Assigned subjects:`, assignedSubjects);
    console.log(`🏫 Assigned classes:`, assignedClasses);
    console.log(`🎯 Coordinated classes:`, coordinatedClasses);
    
    // If teacher has assigned subjects, use those
    if (assignedSubjects.length > 0) {
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

      return res.json({
        message: 'Available options for lesson plan creation (using assigned subjects)',
        options: {
          classes,
          sections,
          subjects,
          subjectGroups: Object.values(subjectGroups),
          assignments: assignedSubjects,
          assignedClasses
        }
      });
    }
    
    // If teacher has assigned classes but no subjects, use department as subject
    if (assignedClasses.length > 0 && staff.department && staff.department.name) {
      const classes = [...new Set(assignedClasses.map(cls => cls.class))].sort();
      const sections = [...new Set(assignedClasses.map(cls => cls.section))].sort();
      
      return res.json({
        message: 'Available options for lesson plan creation (using assigned classes and department as subject)',
        options: {
          classes,
          sections,
          subjects: [staff.department.name],
          subjectGroups: assignedClasses.map(cls => ({
            class: cls.class,
            section: cls.section,
            subjects: [staff.department.name]
          })),
          assignments: assignedClasses.map(cls => ({
            class: cls.class,
            section: cls.section,
            subject: staff.department.name
          })),
          assignedClasses
        }
      });
    }

    // If teacher has coordinated classes but no assigned subjects/classes, use coordinated classes
    if (coordinatedClasses.length > 0 && staff.department && staff.department.name) {
      const classes = [...new Set(coordinatedClasses.map(cls => cls.name || cls.grade))].sort();
      const sections = [...new Set(coordinatedClasses.map(cls => cls.section))].sort();
      
      return res.json({
        message: 'Available options for lesson plan creation (using coordinated classes and department as subject)',
        options: {
          classes,
          sections,
          subjects: [staff.department.name],
          subjectGroups: coordinatedClasses.map(cls => ({
            class: cls.name || cls.grade,
            section: cls.section,
            subjects: [staff.department.name]
          })),
          assignments: coordinatedClasses.map(cls => ({
            class: cls.name || cls.grade,
            section: cls.section,
            subject: staff.department.name
          })),
          assignedClasses: coordinatedClasses.map(cls => ({
            class: cls.name || cls.grade,
            section: cls.section
          }))
        }
      });
    }

    // If teacher has department but no assigned classes/subjects
    if (staff.department && staff.department.name) {
      return res.json({
        message: 'Available options for lesson plan creation (department as subject, no assigned classes)',
        options: {
          classes: [],
          sections: [],
          subjects: [staff.department.name],
          subjectGroups: [],
          assignments: [],
          assignedClasses: []
        }
      });
    }

    // No assignments at all
    return res.status(403).json({ 
      message: 'You are not assigned to any classes or subjects. Please contact your HOD for assignment.',
      options: {
        classes: [],
        sections: [],
        subjects: [],
        subjectGroups: [],
        assignments: [],
        assignedClasses: []
      }
    });
  } catch (error) {
    console.error('Error getting lesson plan options:', error);
    res.status(500).json({ message: error.message });
  }
};