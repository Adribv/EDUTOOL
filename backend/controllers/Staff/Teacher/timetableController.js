const Timetable = require('../../../models/Academic/timetableModel');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');

// Get teacher's timetable
exports.getTimetable = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get teacher's assigned classes and coordinated classes
    const assignedClasses = staff.assignedClasses || [];
    const coordinatedClasses = staff.coordinator || [];
    
    // Build query to find timetables for teacher's classes
    const teacherClasses = [];
    
    // Add classes from assigned classes
    assignedClasses.forEach(cls => {
      teacherClasses.push({
        class: cls.class,
        section: cls.section
      });
    });
    
    // Add classes from coordinated classes
    coordinatedClasses.forEach(coordClass => {
      const className = coordClass.name || coordClass.grade || '';
      const sectionName = coordClass.section || '';
      if (className && sectionName) {
        teacherClasses.push({
          class: className,
          section: sectionName
        });
      }
    });

    // If teacher has no assigned or coordinated classes, return empty timetable
    if (teacherClasses.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No classes assigned yet. Contact your HOD for class assignment.'
      });
    }

    // Get timetables for teacher's classes
    const timetables = await Timetable.find({
      $or: teacherClasses.map(cls => ({
        class: cls.class,
        section: cls.section
      }))
    }).populate('createdBy', 'name');

    // Transform timetable data to match frontend expectations
    const transformedTimetable = [];
    
    timetables.forEach(timetable => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      days.forEach(day => {
        if (timetable[day] && timetable[day].periods) {
          timetable[day].periods.forEach(period => {
            // Only include periods where this teacher is assigned
            if (period.teacher && period.teacher.toString() === req.user.id) {
              transformedTimetable.push({
                id: `${timetable._id}-${day}-${period._id}`,
                day: day.charAt(0).toUpperCase() + day.slice(1),
                time: `${period.startTime} - ${period.endTime}`,
                subject: period.subject,
                class: timetable.class,
                section: timetable.section,
                room: period.room || 'TBD',
                teacher: period.teacher,
                timetableId: timetable._id,
                periodId: period._id
              });
            }
          });
        }
      });
    });

    res.json({
      success: true,
      data: transformedTimetable
    });
  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch timetable',
      error: error.message 
    });
  }
};

// Add timetable entry
exports.addTimetableEntry = async (req, res) => {
  try {
    const { day, time, subject, class: cls, section, room } = req.body;
    
    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Use teacher's default assigned classes if no specific class/section provided
    let finalClass = cls;
    let finalSection = section;

    // If no class/section provided, use teacher's default assigned class
    if (!cls || !section) {
      if (staff.assignedClasses && staff.assignedClasses.length > 0) {
        finalClass = staff.assignedClasses[0].class;
        finalSection = staff.assignedClasses[0].section;
        console.log(`📚 Using teacher's default assigned class: ${finalClass}-${finalSection}`);
      } else if (staff.coordinator && staff.coordinator.length > 0) {
        // Fallback to coordinated classes
        const firstCoordClass = Array.isArray(staff.coordinator) ? staff.coordinator[0] : staff.coordinator;
        if (firstCoordClass) {
          finalClass = firstCoordClass.name || firstCoordClass.grade || '';
          finalSection = firstCoordClass.section || '';
          console.log(`📚 Using teacher's coordinated class: ${finalClass}-${finalSection}`);
        }
      } else {
        return res.status(403).json({ 
          message: 'You are not assigned to any classes. Please contact your HOD for class assignment.' 
        });
      }
    } else {
      // Validate that teacher is assigned to this specific class/section
      const hasAssignedClasses = staff.assignedClasses && staff.assignedClasses.length > 0;
      const hasCoordinatedClasses = staff.coordinator && staff.coordinator.length > 0;
      
      let isAssigned = false;
      
      if (hasAssignedClasses) {
        isAssigned = staff.assignedClasses.some(
          assignedClass => assignedClass.class === cls && assignedClass.section === section
        );
      }
      
      if (!isAssigned && hasCoordinatedClasses) {
        isAssigned = staff.coordinator.some(
          coordClass => (
            coordClass.name === cls || 
            (coordClass.grade === cls && coordClass.section === section)
          )
        );
      }
      
      if (!isAssigned) {
        return res.status(403).json({ 
          message: 'You are not assigned to this class/section combination' 
        });
      }
    }

    // Parse time slot
    const [startTime, endTime] = time.split(' - ');
    
    // Normalize class and section to handle format variations
    const normalizedClass = finalClass.toString().trim();
    const normalizedSection = finalSection.toString().trim();
    
    // Find or create timetable for this class-section
    let timetable = await Timetable.findOne({
      class: normalizedClass,
      section: normalizedSection,
      isActive: true
    });

    if (!timetable) {
      // Create new timetable
      timetable = new Timetable({
        class: normalizedClass,
        section: normalizedSection,
        academicYear: new Date().getFullYear().toString(),
        term: 'Current',
        isActive: true,
        createdBy: req.user.id
      });
    }

    // Add period to the specified day
    const dayKey = day.toLowerCase();
    if (!timetable[dayKey]) {
      timetable[dayKey] = { periods: [] };
    }

    // Check if there's already a period at this time
    const existingPeriod = timetable[dayKey].periods.find(
      period => period.startTime === startTime && period.endTime === endTime
    );

    if (existingPeriod) {
      return res.status(400).json({ 
        message: 'A class is already scheduled at this time slot' 
      });
    }

    // Add new period
    timetable[dayKey].periods.push({
      subject: subject,
      teacher: req.user.id,
      startTime: startTime,
      endTime: endTime,
      room: room || 'TBD'
    });

    await timetable.save();

    res.status(201).json({
      success: true,
      message: 'Timetable entry added successfully',
      data: {
        id: `${timetable._id}-${dayKey}-${timetable[dayKey].periods[timetable[dayKey].periods.length - 1]._id}`,
        day: day,
        time: time,
        subject: subject,
        class: normalizedClass,
        section: normalizedSection,
        room: room || 'TBD',
        teacher: req.user.id
      }
    });
  } catch (error) {
    console.error('Error adding timetable entry:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add timetable entry',
      error: error.message 
    });
  }
};

// Update timetable entry
exports.updateTimetableEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { day, time, subject, class: cls, section, room } = req.body;
    
    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Parse entryId to get timetable and period IDs
    const [timetableId, dayKey, periodId] = entryId.split('-');
    
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Find the period
    const period = timetable[dayKey]?.periods?.find(p => p._id.toString() === periodId);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }

    // Check if teacher owns this period
    if (period.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own timetable entries' });
    }

    // Update period
    if (time) {
      const [startTime, endTime] = time.split(' - ');
      period.startTime = startTime;
      period.endTime = endTime;
    }
    if (subject) period.subject = subject;
    if (room) period.room = room;

    await timetable.save();

    res.json({
      success: true,
      message: 'Timetable entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update timetable entry',
      error: error.message 
    });
  }
};

// Delete timetable entry
exports.deleteTimetableEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Parse entryId to get timetable and period IDs
    const [timetableId, dayKey, periodId] = entryId.split('-');
    
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Find and remove the period
    if (timetable[dayKey] && timetable[dayKey].periods) {
      const periodIndex = timetable[dayKey].periods.findIndex(p => p._id.toString() === periodId);
      
      if (periodIndex === -1) {
        return res.status(404).json({ message: 'Period not found' });
      }

      // Check if teacher owns this period
      if (timetable[dayKey].periods[periodIndex].teacher.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete your own timetable entries' });
      }

      timetable[dayKey].periods.splice(periodIndex, 1);
      await timetable.save();
    }

    res.json({
      success: true,
      message: 'Timetable entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete timetable entry',
      error: error.message 
    });
  }
};

// Request substitution
exports.requestSubstitution = async (req, res) => {
  try {
    const { date, reason, substituteTeacherId, class: cls, section, subject } = req.body;
    
    // For now, return a placeholder response
    // This would typically create a substitution request in the database
    res.status(201).json({
      success: true,
      message: 'Substitution request submitted successfully',
      data: {
        id: Date.now(),
        date,
        reason,
        substituteTeacherId,
        class: cls,
        section,
        subject,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error requesting substitution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to request substitution',
      error: error.message 
    });
  }
};

// Get substitution requests
exports.getSubstitutionRequests = async (req, res) => {
  try {
    // For now, return empty array
    // This would typically fetch substitution requests from the database
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching substitution requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch substitution requests',
      error: error.message 
    });
  }
};

// Get academic calendar
exports.getAcademicCalendar = async (req, res) => {
  try {
    // For now, return empty array
    // This would typically fetch academic calendar events from the database
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching academic calendar:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch academic calendar',
      error: error.message 
    });
  }
};