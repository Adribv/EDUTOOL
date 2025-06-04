const Timetable = require('../../../models/Staff/Teacher/timetable.model');
const Substitution = require('../../../models/Staff/Teacher/substitution.model');
const AcademicCalendar = require('../../../models/Staff/Teacher/academicCalendar.model');
const Staff = require('../../../models/Staff/staffModel');

// Get teacher's timetable
exports.getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({ staffId: req.user.id });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request substitution
exports.requestSubstitution = async (req, res) => {
  try {
    const { date, periodNumber, class: cls, section, subject, reason } = req.body;
    
    const substitution = new Substitution({
      requestedBy: req.user.id,
      date,
      periodNumber,
      class: cls,
      section,
      subject,
      reason
    });
    
    await substitution.save();
    res.status(201).json(substitution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get substitution requests
exports.getSubstitutionRequests = async (req, res) => {
  try {
    const substitutions = await Substitution.find({ requestedBy: req.user.id })
      .populate('substituteTeacher', 'name email')
      .populate('approvedBy', 'name email');
    
    res.json(substitutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get academic calendar
exports.getAcademicCalendar = async (req, res) => {
  try {
    // Get teacher's assigned classes
    const staff = await Staff.findById(req.user.id);
    const assignedClasses = [...new Set(staff.assignedSubjects.map(subject => subject.class))];
    
    // Get calendar events for all classes and teacher's assigned classes
    const calendarEvents = await AcademicCalendar.find({
      $or: [
        { forClasses: 'All' },
        { forClasses: { $in: assignedClasses } }
      ]
    }).populate('createdBy', 'name');
    
    res.json(calendarEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};