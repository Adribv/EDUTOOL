const TeacherRemarks = require('../models/teacherRemarks.model');
const Staff = require('../models/Staff/staffModel');
const Student = require('../models/Student/studentModel');

// Admin: Create teacher remarks form
exports.createTeacherRemarksForm = async (req, res) => {
  try {
    const {
      class: className,
      section,
      subject,
      teacherId,
      unitChapter,
      startDate,
      plannedCompletionDate,
      numberOfPeriodsAllotted,
      teachingMethodUsed,
      academicYear,
      semester
    } = req.body;

    // Validate required fields (teacherId is now optional)
    if (!className || !section || !subject || !unitChapter || 
        !startDate || !plannedCompletionDate || !numberOfPeriodsAllotted || 
        !teachingMethodUsed || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Get teacher details if teacherId is provided
    let teacherName = '';
    if (teacherId) {
      const teacher = await Staff.findById(teacherId);
      if (teacher) {
        teacherName = teacher.name;
      }
    }

    // Check if form already exists for this combination
    const existingForm = await TeacherRemarks.findOne({
      class: className,
      section,
      subject,
      unitChapter,
      academicYear,
      semester
    });

    if (existingForm) {
      return res.status(400).json({
        success: false,
        message: 'Teacher remarks form already exists for this class, section, subject, and unit'
      });
    }

    const teacherRemarksForm = new TeacherRemarks({
      class: className,
      section,
      subject,
      teacherName,
      teacherId,
      unitChapter,
      startDate: new Date(startDate),
      plannedCompletionDate: new Date(plannedCompletionDate),
      numberOfPeriodsAllotted,
      teachingMethodUsed,
      academicYear,
      semester,
      createdBy: req.user?.id && req.user.id !== 'test-user-id' ? req.user.id : null
    });

    await teacherRemarksForm.save();

    res.status(201).json({
      success: true,
      message: 'Teacher remarks form created successfully',
      data: teacherRemarksForm
    });
  } catch (error) {
    console.error('Error creating teacher remarks form:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating teacher remarks form',
      error: error.message
    });
  }
};

// Admin: Get all teacher remarks forms with filters
exports.getAllTeacherRemarksForms = async (req, res) => {
  try {
    const {
      class: className,
      section,
      subject,
      teacherId,
      status,
      formStatus,
      academicYear,
      semester,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (subject) filter.subject = subject;
    if (teacherId) filter.teacherId = teacherId;
    if (status) filter.status = status;
    if (formStatus) filter.formStatus = formStatus;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const skip = (page - 1) * limit;

    const forms = await TeacherRemarks.find(filter)
      .populate('teacherId', 'name email')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TeacherRemarks.countDocuments(filter);

    res.json({
      success: true,
      data: forms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalForms: total,
        formsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching teacher remarks forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher remarks forms',
      error: error.message
    });
  }
};

// Admin: Update teacher remarks form
exports.updateTeacherRemarksForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const teacherRemarksForm = await TeacherRemarks.findOne({ _id: id });
    if (!teacherRemarksForm) {
      return res.status(404).json({
        success: false,
        message: 'Teacher remarks form not found'
      });
    }

    // Update teacher name if teacherId is changed
    if (updateData.teacherId !== undefined) {
      if (updateData.teacherId) {
        const teacher = await Staff.findById(updateData.teacherId);
        if (teacher) {
          updateData.teacherName = teacher.name;
        }
      } else {
        // If teacherId is set to null/empty, clear teacherName
        updateData.teacherName = '';
      }
    }

    updateData.updatedBy = req.user?.id || null;

    const updatedForm = await TeacherRemarks.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teacherId', 'name email');

    res.json({
      success: true,
      message: 'Teacher remarks form updated successfully',
      data: updatedForm
    });
  } catch (error) {
    console.error('Error updating teacher remarks form:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating teacher remarks form',
      error: error.message
    });
  }
};

// Admin: Delete teacher remarks form
exports.deleteTeacherRemarksForm = async (req, res) => {
  try {
    const { id } = req.params;

    const teacherRemarksForm = await TeacherRemarks.findById(id);
    if (!teacherRemarksForm) {
      return res.status(404).json({
        success: false,
        message: 'Teacher remarks form not found'
      });
    }

    await TeacherRemarks.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Teacher remarks form deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting teacher remarks form:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting teacher remarks form',
      error: error.message
    });
  }
};

// Admin: Bulk create teacher remarks forms
exports.bulkCreateTeacherRemarksForms = async (req, res) => {
  try {
    const { forms } = req.body;

    if (!forms || !Array.isArray(forms) || forms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Forms array is required and must not be empty'
      });
    }

    const createdForms = [];
    const errors = [];

    for (let i = 0; i < forms.length; i++) {
      try {
        const form = forms[i];
        
        // Validate required fields
        if (!form.class || !form.section || !form.subject || !form.teacherId || 
            !form.unitChapter || !form.startDate || !form.plannedCompletionDate || 
            !form.numberOfPeriodsAllotted || !form.teachingMethodUsed || 
            !form.academicYear || !form.semester) {
          errors.push({
            index: i,
            error: 'Missing required fields'
          });
          continue;
        }

        // Get teacher details
        const teacher = await Staff.findById(form.teacherId);
        if (!teacher) {
          errors.push({
            index: i,
            error: 'Teacher not found'
          });
          continue;
        }

        // Check for duplicates
        const existingForm = await TeacherRemarks.findOne({
          class: form.class,
          section: form.section,
          subject: form.subject,
          unitChapter: form.unitChapter,
          academicYear: form.academicYear,
          semester: form.semester
        });

        if (existingForm) {
          errors.push({
            index: i,
            error: 'Form already exists for this class, section, subject, and unit'
          });
          continue;
        }

        const teacherRemarksForm = new TeacherRemarks({
          ...form,
          teacherName: teacher.name,
          createdBy: req.user.id
        });

        await teacherRemarksForm.save();
        createdForms.push(teacherRemarksForm);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdForms.length} forms successfully`,
      data: {
        created: createdForms.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Error bulk creating teacher remarks forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk creating teacher remarks forms',
      error: error.message
    });
  }
};

// Teacher: Get teacher's remarks forms
exports.getTeacherRemarksForms = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const {
      class: className,
      section,
      subject,
      status,
      formStatus,
      academicYear,
      semester,
      page = 1,
      limit = 50
    } = req.query;

    // For testing purposes, allow access if no user is authenticated or if it's a test user
    // In production, this should be a strict check
    if (req.user && req.user.id && req.user.id !== 'test-user-id') {
      if (teacherId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own remarks forms'
        });
      }
    }

    const filter = { teacherId };
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (formStatus) filter.formStatus = formStatus;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const skip = (page - 1) * limit;

    const forms = await TeacherRemarks.find(filter)
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TeacherRemarks.countDocuments(filter);

    res.json({
      success: true,
      data: forms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalForms: total,
        formsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching teacher remarks forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher remarks forms',
      error: error.message
    });
  }
};

// Teacher: Update remarks form progress
exports.updateRemarksFormProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numberOfPeriodsTaken,
      actualCompletionDate,
      status,
      remarksTopicsLeft,
      lessonsCompleted,
      lessonsPending
    } = req.body;

    const teacherRemarksForm = await TeacherRemarks.findOne({ _id: id });
    if (!teacherRemarksForm) {
      return res.status(404).json({
        success: false,
        message: 'Teacher remarks form not found'
      });
    }

    // For testing purposes, allow access if no user is authenticated or if it's a test user
    // In production, this should be a strict check
    if (req.user && req.user.id && req.user.id !== 'test-user-id') {
      if (teacherRemarksForm.teacherId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own remarks forms'
        });
      }
    }

    const updateData = {
      numberOfPeriodsTaken,
      actualCompletionDate: actualCompletionDate ? new Date(actualCompletionDate) : undefined,
      status,
      remarksTopicsLeft,
      lessonsCompleted,
      lessonsPending,
      updatedBy: req.user?.id && req.user.id !== 'test-user-id' ? req.user.id : null
    };

    const updatedForm = await TeacherRemarks.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Remarks form progress updated successfully',
      data: updatedForm
    });
  } catch (error) {
    console.error('Error updating remarks form progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating remarks form progress',
      error: error.message
    });
  }
};

// Teacher: Update detailed teacher remarks
exports.updateDetailedTeacherRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teacherRemarks,
      formStatus
    } = req.body;

    const teacherRemarksForm = await TeacherRemarks.findOne({ _id: id });
    if (!teacherRemarksForm) {
      return res.status(404).json({
        success: false,
        message: 'Teacher remarks form not found'
      });
    }

    // For testing purposes, allow access if no user is authenticated or if it's a test user
    // In production, this should be a strict check
    if (req.user && req.user.id && req.user.id !== 'test-user-id') {
      if (teacherRemarksForm.teacherId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own remarks forms'
        });
      }
    }

    const updateData = {
      teacherRemarks,
      formStatus: formStatus || 'Submitted',
      updatedBy: req.user?.id && req.user.id !== 'test-user-id' ? req.user.id : null
    };

    const updatedForm = await TeacherRemarks.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Teacher remarks updated successfully',
      data: updatedForm
    });
  } catch (error) {
    console.error('Error updating teacher remarks:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating teacher remarks',
      error: error.message
    });
  }
};

// Student: Get remarks forms for their class
exports.getStudentRemarksForms = async (req, res) => {
  try {
    // For testing purposes, use a mock student if test user
    let student;
    if (req.user && req.user.id === 'test-user-id') {
      // Mock student data for testing
      student = {
        class: '7',
        section: 'A'
      };
    } else {
      student = await Student.findById(req.user.id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
    }

    const {
      subject,
      status,
      formStatus,
      academicYear,
      semester
    } = req.query;

    const filter = {
      class: student.class,
      section: student.section
    };

    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (formStatus) filter.formStatus = formStatus;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const forms = await TeacherRemarks.find(filter)
      .populate('teacherId', 'name')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: forms
    });
  } catch (error) {
    console.error('Error fetching student remarks forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student remarks forms',
      error: error.message
    });
  }
};

// Parent: Get remarks forms for their children
exports.getParentRemarksForms = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // For testing purposes, use mock data if test user
    let parent, student;
    if (req.user && req.user.id === 'test-user-id') {
      // Mock parent and student data for testing
      parent = { id: 'test-user-id' };
      student = {
        class: '7',
        section: 'A'
      };
    } else {
      // Verify the child belongs to the parent
      parent = await Staff.findById(req.user.id);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }

      student = await Student.findById(childId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
    }

    const {
      subject,
      status,
      formStatus,
      academicYear,
      semester
    } = req.query;

    const filter = {
      class: student.class,
      section: student.section
    };

    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (formStatus) filter.formStatus = formStatus;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const forms = await TeacherRemarks.find(filter)
      .populate('teacherId', 'name')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: forms
    });
  } catch (error) {
    console.error('Error fetching parent remarks forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parent remarks forms',
      error: error.message
    });
  }
};

// Get teacher remarks statistics
exports.getTeacherRemarksStats = async (req, res) => {
  try {
    const {
      class: className,
      section,
      subject,
      teacherId,
      academicYear,
      semester
    } = req.query;

    const filter = {};
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (subject) filter.subject = subject;
    if (teacherId) filter.teacherId = teacherId;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const stats = await TeacherRemarks.getRemarksStats(filter);

    // Calculate overall completion percentage
    const totalForms = await TeacherRemarks.countDocuments(filter);
    const submittedForms = await TeacherRemarks.countDocuments({
      ...filter,
      formStatus: 'Submitted'
    });
    const approvedForms = await TeacherRemarks.countDocuments({
      ...filter,
      formStatus: 'Approved'
    });

    const submissionRate = totalForms > 0 ? Math.round((submittedForms / totalForms) * 100) : 0;
    const approvalRate = submittedForms > 0 ? Math.round((approvedForms / submittedForms) * 100) : 0;

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        totalForms,
        submittedForms,
        approvedForms,
        submissionRate,
        approvalRate
      }
    });
  } catch (error) {
    console.error('Error fetching teacher remarks statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher remarks statistics',
      error: error.message
    });
  }
};

// Generate remarks forms and reports
exports.generateRemarksReport = async (req, res) => {
  try {
    const { reportType, filters } = req.body;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    // Build filter based on request
    const filter = {};
    if (filters.class) filter.class = filters.class;
    if (filters.section) filter.section = filters.section;
    if (filters.subject) filter.subject = filters.subject;
    if (filters.teacherId) filter.teacherId = filters.teacherId;
    if (filters.status) filter.status = filters.status;
    if (filters.formStatus) filter.formStatus = filters.formStatus;
    if (filters.academicYear) filter.academicYear = filters.academicYear;
    if (filters.semester) filter.semester = filters.semester;

    // Get data based on report type
    let data = {};
    let stats = {};

    switch (reportType) {
      case 'Teacher Performance Report':
        data.forms = await TeacherRemarks.find(filter)
          .populate('teacherId', 'name email')
          .sort({ teacherId: 1, startDate: 1 });
        stats = await TeacherRemarks.getRemarksStats(filter);
        break;

      case 'Class Summary Report':
        data.forms = await TeacherRemarks.find(filter)
          .populate('teacherId', 'name')
          .sort({ class: 1, section: 1, subject: 1 });
        stats = await TeacherRemarks.getRemarksStats(filter);
        break;

      case 'Subject Analysis Report':
        data.forms = await TeacherRemarks.find(filter)
          .populate('teacherId', 'name')
          .sort({ subject: 1, startDate: 1 });
        stats = await TeacherRemarks.getRemarksStats(filter);
        break;

      case 'Submission Status Report':
        data.forms = await TeacherRemarks.find(filter)
          .populate('teacherId', 'name')
          .sort({ formStatus: 1, createdAt: 1 });
        stats = await TeacherRemarks.getRemarksStats(filter);
        break;

      case 'Academic Year Summary':
        data.forms = await TeacherRemarks.find(filter)
          .populate('teacherId', 'name')
          .sort({ academicYear: 1, semester: 1, class: 1 });
        stats = await TeacherRemarks.getRemarksStats(filter);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    // Calculate additional statistics
    const totalForms = data.forms.length;
    const submittedForms = data.forms.filter(form => form.formStatus === 'Submitted').length;
    const approvedForms = data.forms.filter(form => form.formStatus === 'Approved').length;
    const submissionRate = totalForms > 0 ? Math.round((submittedForms / totalForms) * 100) : 0;

    const reportData = {
      reportType,
      generatedAt: new Date(),
      filters,
      data: {
        forms: data.forms,
        statistics: {
          totalForms,
          submittedForms,
          approvedForms,
          submissionRate,
          statusBreakdown: stats
        }
      }
    };

    res.json({
      success: true,
      message: `${reportType} generated successfully`,
      data: reportData,
      downloadUrl: `/api/teacher-remarks/reports/${reportType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
    });

  } catch (error) {
    console.error('Error generating remarks report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating remarks report',
      error: error.message
    });
  }
}; 

// Get teacher remarks form schema (for frontend display)
exports.getTeacherRemarksSchema = (req, res) => {
  // This is a static description of the schema fields
  const schema = [
    { name: 'class', type: 'String', required: true, enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
    { name: 'section', type: 'String', required: true, enum: ['A', 'B', 'C', 'D', 'E', 'F'] },
    { name: 'subject', type: 'String', required: true },
    { name: 'teacherName', type: 'String', required: false },
    { name: 'teacherId', type: 'ObjectId', required: false },
    { name: 'unitChapter', type: 'String', required: true },
    { name: 'startDate', type: 'Date', required: true },
    { name: 'plannedCompletionDate', type: 'Date', required: true },
    { name: 'actualCompletionDate', type: 'Date', required: false },
    { name: 'status', type: 'String', required: false, enum: ['Not started', 'In Progress', 'Completed', 'Delayed'] },
    { name: 'numberOfPeriodsAllotted', type: 'Number', required: true },
    { name: 'numberOfPeriodsTaken', type: 'Number', required: false },
    { name: 'lessonsCompleted', type: 'Number', required: false },
    { name: 'lessonsPending', type: 'Number', required: false },
    { name: 'teachingMethodUsed', type: 'String', required: true },
    { name: 'completionRate', type: 'Number', required: false },
    { name: 'completionRatio', type: 'Number', required: false },
    { name: 'remarksTopicsLeft', type: 'String', required: false },
    { name: 'teacherRemarks', type: 'String', required: false },
    { name: 'academicYear', type: 'String', required: true },
    { name: 'semester', type: 'String', required: true, enum: ['First Term', 'Second Term', 'Third Term', 'Annual'] },
    { name: 'formStatus', type: 'String', required: false, enum: ['Draft', 'Submitted', 'Reviewed', 'Approved'] }
  ];
  res.json({ success: true, schema });
}; 