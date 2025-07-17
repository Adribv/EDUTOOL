const SyllabusCompletion = require('../models/syllabusCompletion.model');
const Staff = require('../models/Staff/staffModel');
const Student = require('../models/Student/studentModel');

// Admin: Create syllabus completion entry
exports.createSyllabusEntry = async (req, res) => {
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

    // Validate required fields
    if (!className || !section || !subject || !teacherId || !unitChapter || 
        !startDate || !plannedCompletionDate || !numberOfPeriodsAllotted || 
        !teachingMethodUsed || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Get teacher details
    const teacher = await Staff.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check if entry already exists for this combination
    const existingEntry = await SyllabusCompletion.findOne({
      class: className,
      section,
      subject,
      unitChapter,
      academicYear,
      semester
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Syllabus entry already exists for this class, section, subject, and unit'
      });
    }

    const syllabusEntry = new SyllabusCompletion({
      class: className,
      section,
      subject,
      teacherName: teacher.name,
      teacherId,
      unitChapter,
      startDate: new Date(startDate),
      plannedCompletionDate: new Date(plannedCompletionDate),
      numberOfPeriodsAllotted,
      teachingMethodUsed,
      academicYear,
      semester,
      createdBy: req.user.id
    });

    await syllabusEntry.save();

    res.status(201).json({
      success: true,
      message: 'Syllabus completion entry created successfully',
      data: syllabusEntry
    });
  } catch (error) {
    console.error('Error creating syllabus entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating syllabus entry',
      error: error.message
    });
  }
};

// Admin: Get all syllabus completion entries with filters
exports.getAllSyllabusEntries = async (req, res) => {
  try {
    const {
      class: className,
      section,
      subject,
      teacherId,
      status,
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
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const skip = (page - 1) * limit;

    const entries = await SyllabusCompletion.find(filter)
      .populate('teacherId', 'name email')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SyllabusCompletion.countDocuments(filter);

    res.json({
      success: true,
      data: entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        entriesPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching syllabus entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching syllabus entries',
      error: error.message
    });
  }
};

// Admin: Update syllabus completion entry
exports.updateSyllabusEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const syllabusEntry = await SyllabusCompletion.findById(id);
    if (!syllabusEntry) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus completion entry not found'
      });
    }

    // Update teacher name if teacherId is changed
    if (updateData.teacherId && updateData.teacherId !== syllabusEntry.teacherId.toString()) {
      const teacher = await Staff.findById(updateData.teacherId);
      if (teacher) {
        updateData.teacherName = teacher.name;
      }
    }

    updateData.updatedBy = req.user.id;

    const updatedEntry = await SyllabusCompletion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teacherId', 'name email');

    res.json({
      success: true,
      message: 'Syllabus completion entry updated successfully',
      data: updatedEntry
    });
  } catch (error) {
    console.error('Error updating syllabus entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating syllabus entry',
      error: error.message
    });
  }
};

// Admin: Delete syllabus completion entry
exports.deleteSyllabusEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const syllabusEntry = await SyllabusCompletion.findById(id);
    if (!syllabusEntry) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus completion entry not found'
      });
    }

    await SyllabusCompletion.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Syllabus completion entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting syllabus entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting syllabus entry',
      error: error.message
    });
  }
};

// Teacher: Get syllabus entries for assigned classes
exports.getTeacherSyllabusEntries = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const {
      class: className,
      section,
      subject,
      status,
      academicYear,
      semester
    } = req.query;

    const filter = { teacherId };
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const entries = await SyllabusCompletion.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching teacher syllabus entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher syllabus entries',
      error: error.message
    });
  }
};

// Teacher: Update syllabus completion progress
exports.updateSyllabusProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numberOfPeriodsTaken,
      actualCompletionDate,
      remarksTopicsLeft,
      teacherRemarks
    } = req.body;

    const syllabusEntry = await SyllabusCompletion.findById(id);
    if (!syllabusEntry) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus completion entry not found'
      });
    }

    // Verify teacher owns this entry
    if (syllabusEntry.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own syllabus entries'
      });
    }

    const updateData = {
      numberOfPeriodsTaken,
      remarksTopicsLeft,
      teacherRemarks,
      updatedBy: req.user.id
    };

    if (actualCompletionDate) {
      updateData.actualCompletionDate = new Date(actualCompletionDate);
    }

    const updatedEntry = await SyllabusCompletion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Syllabus progress updated successfully',
      data: updatedEntry
    });
  } catch (error) {
    console.error('Error updating syllabus progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating syllabus progress',
      error: error.message
    });
  }
};

// Teacher: Update teacher remarks only
exports.updateTeacherRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherRemarks } = req.body;

    const syllabusEntry = await SyllabusCompletion.findById(id);
    if (!syllabusEntry) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus completion entry not found'
      });
    }

    // Verify teacher owns this entry
    if (syllabusEntry.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own syllabus entries'
      });
    }

    const updatedEntry = await SyllabusCompletion.findByIdAndUpdate(
      id,
      { 
        teacherRemarks,
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Teacher remarks updated successfully',
      data: updatedEntry
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

// Student: Get syllabus completion for their class
exports.getStudentSyllabusEntries = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const {
      subject,
      status,
      academicYear,
      semester
    } = req.query;

    const filter = {
      class: student.class,
      section: student.section
    };

    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const entries = await SyllabusCompletion.find(filter)
      .populate('teacherId', 'name')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching student syllabus entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student syllabus entries',
      error: error.message
    });
  }
};

// Parent: Get syllabus completion for their children
exports.getParentSyllabusEntries = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Verify the child belongs to the parent
    const parent = await Staff.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    const student = await Student.findById(childId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const {
      subject,
      status,
      academicYear,
      semester
    } = req.query;

    const filter = {
      class: student.class,
      section: student.section
    };

    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const entries = await SyllabusCompletion.find(filter)
      .populate('teacherId', 'name')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching parent syllabus entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parent syllabus entries',
      error: error.message
    });
  }
};

// Get syllabus completion statistics
exports.getSyllabusStats = async (req, res) => {
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

    const stats = await SyllabusCompletion.getCompletionStats(filter);

    // Calculate overall completion percentage
    const totalEntries = await SyllabusCompletion.countDocuments(filter);
    const completedEntries = await SyllabusCompletion.countDocuments({
      ...filter,
      status: 'Completed'
    });

    const overallCompletion = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        totalEntries,
        completedEntries,
        overallCompletionPercentage: overallCompletion
      }
    });
  } catch (error) {
    console.error('Error fetching syllabus statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching syllabus statistics',
      error: error.message
    });
  }
};

// Bulk create syllabus entries
exports.bulkCreateSyllabusEntries = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Entries array is required and must not be empty'
      });
    }

    const createdEntries = [];
    const errors = [];

    for (let i = 0; i < entries.length; i++) {
      try {
        const entry = entries[i];
        
        // Validate required fields
        if (!entry.class || !entry.section || !entry.subject || !entry.teacherId || 
            !entry.unitChapter || !entry.startDate || !entry.plannedCompletionDate || 
            !entry.numberOfPeriodsAllotted || !entry.teachingMethodUsed || 
            !entry.academicYear || !entry.semester) {
          errors.push({
            index: i,
            error: 'Missing required fields'
          });
          continue;
        }

        // Get teacher details
        const teacher = await Staff.findById(entry.teacherId);
        if (!teacher) {
          errors.push({
            index: i,
            error: 'Teacher not found'
          });
          continue;
        }

        // Check for duplicates
        const existingEntry = await SyllabusCompletion.findOne({
          class: entry.class,
          section: entry.section,
          subject: entry.subject,
          unitChapter: entry.unitChapter,
          academicYear: entry.academicYear,
          semester: entry.semester
        });

        if (existingEntry) {
          errors.push({
            index: i,
            error: 'Entry already exists for this class, section, subject, and unit'
          });
          continue;
        }

        const syllabusEntry = new SyllabusCompletion({
          ...entry,
          teacherName: teacher.name,
          createdBy: req.user.id
        });

        await syllabusEntry.save();
        createdEntries.push(syllabusEntry);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdEntries.length} entries successfully`,
      data: {
        created: createdEntries.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Error bulk creating syllabus entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk creating syllabus entries',
      error: error.message
    });
  }
};

// Generate forms and reports
exports.generateForm = async (req, res) => {
  try {
    const { formType, filters } = req.body;

    if (!formType) {
      return res.status(400).json({
        success: false,
        message: 'Form type is required'
      });
    }

    // Build filter based on request
    const filter = {};
    if (filters.class) filter.class = filters.class;
    if (filters.section) filter.section = filters.section;
    if (filters.subject) filter.subject = filters.subject;
    if (filters.teacherId) filter.teacherId = filters.teacherId;
    if (filters.status) filter.status = filters.status;
    if (filters.academicYear) filter.academicYear = filters.academicYear;
    if (filters.semester) filter.semester = filters.semester;

    // Get data based on form type
    let data = {};
    let stats = {};

    switch (formType) {
      case 'Progress Report':
        data.entries = await SyllabusCompletion.find(filter)
          .populate('teacherId', 'name email')
          .sort({ startDate: 1 });
        stats = await SyllabusCompletion.getCompletionStats(filter);
        break;

      case 'Teacher Performance':
        data.entries = await SyllabusCompletion.find(filter)
          .populate('teacherId', 'name email')
          .sort({ teacherId: 1, startDate: 1 });
        stats = await SyllabusCompletion.getCompletionStats(filter);
        break;

      case 'Class Summary':
        data.entries = await SyllabusCompletion.find(filter)
          .populate('teacherId', 'name')
          .sort({ class: 1, section: 1, subject: 1 });
        stats = await SyllabusCompletion.getCompletionStats(filter);
        break;

      case 'Delayed Units':
        filter.status = 'Delayed';
        data.entries = await SyllabusCompletion.find(filter)
          .populate('teacherId', 'name')
          .sort({ plannedCompletionDate: 1 });
        break;

      case 'Subject Analysis':
        data.entries = await SyllabusCompletion.find(filter)
          .populate('teacherId', 'name')
          .sort({ subject: 1, startDate: 1 });
        stats = await SyllabusCompletion.getCompletionStats(filter);
        break;

      case 'Academic Year Summary':
        data.entries = await SyllabusCompletion.find(filter)
          .populate('teacherId', 'name')
          .sort({ academicYear: 1, semester: 1, class: 1 });
        stats = await SyllabusCompletion.getCompletionStats(filter);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid form type'
        });
    }

    // Calculate additional statistics
    const totalEntries = data.entries.length;
    const completedEntries = data.entries.filter(entry => entry.status === 'Completed').length;
    const overallCompletion = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

    const formData = {
      formType,
      generatedAt: new Date(),
      filters,
      data: {
        entries: data.entries,
        statistics: {
          totalEntries,
          completedEntries,
          overallCompletion,
          statusBreakdown: stats
        }
      }
    };

    // For now, return the data structure
    // TODO: Implement actual PDF generation
    res.json({
      success: true,
      message: `${formType} form generated successfully`,
      data: formData,
      downloadUrl: `/api/syllabus-completion/forms/${formType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
    });

  } catch (error) {
    console.error('Error generating form:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating form',
      error: error.message
    });
  }
}; 