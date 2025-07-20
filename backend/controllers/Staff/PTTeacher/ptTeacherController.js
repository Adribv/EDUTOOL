const SportEvent = require('../../../models/SportEvent');
const FitnessRecord = require('../../../models/FitnessRecord');
const Student = require('../../../models/Student');
const Team = require('../../../models/Team');
const Equipment = require('../../../models/Equipment');
const Tournament = require('../../../models/Tournament');
const Achievement = require('../../../models/Achievement');

// Sports Event Management Controllers
const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sport, date } = req.query;
    const query = {};

    if (status) query.status = status;
    if (sport) query.sport = sport;
    if (date) query.date = { $gte: new Date(date) };

    const events = await SportEvent.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await SportEvent.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await SportEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = new SportEvent({
      ...req.body,
      organizerId: req.user.id
    });
    
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await SportEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await SportEvent.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await SportEvent.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fitness Assessment Controllers
const getAllFitnessRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, date } = req.query;
    const query = {};

    if (studentId) query.studentId = studentId;
    if (date) query.date = { $gte: new Date(date) };

    const records = await FitnessRecord.find(query)
      .populate('studentId', 'name class')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await FitnessRecord.countDocuments(query);

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFitnessRecordById = async (req, res) => {
  try {
    const record = await FitnessRecord.findById(req.params.id)
      .populate('studentId', 'name class email');
    
    if (!record) {
      return res.status(404).json({ message: 'Fitness record not found' });
    }
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFitnessRecord = async (req, res) => {
  try {
    const record = new FitnessRecord({
      ...req.body,
      teacherId: req.user.id
    });
    
    const newRecord = await record.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFitnessRecord = async (req, res) => {
  try {
    const record = await FitnessRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!record) {
      return res.status(404).json({ message: 'Fitness record not found' });
    }
    
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFitnessRecord = async (req, res) => {
  try {
    const record = await FitnessRecord.findByIdAndDelete(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Fitness record not found' });
    }
    
    res.json({ message: 'Fitness record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student Management Controllers
const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, class: studentClass } = req.query;
    const query = {};

    if (studentClass) query.class = studentClass;

    const students = await Student.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentFitnessHistory = async (req, res) => {
  try {
    const records = await FitnessRecord.find({ studentId: req.params.id })
      .sort({ date: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentParticipation = async (req, res) => {
  try {
    const participation = await SportEvent.find({
      'participants.studentId': req.params.id
    }).sort({ date: -1 });
    
    res.json(participation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Team Management Controllers
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', 'name class')
      .sort({ createdAt: -1 });
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'name class');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTeam = async (req, res) => {
  try {
    const team = new Team({
      ...req.body,
      coachId: req.user.id
    });
    
    const newTeam = await team.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { studentId } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: studentId } },
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.studentId } },
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Equipment Management Controllers
const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment({
      ...req.body,
      addedBy: req.user.id
    });
    
    const newEquipment = await equipment.save();
    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEquipmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Analytics Controllers
const getOverviewAnalytics = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeAthletes = await Team.aggregate([
      { $unwind: '$members' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const upcomingEvents = await SportEvent.countDocuments({ status: 'Upcoming' });
    const completedEvents = await SportEvent.countDocuments({ status: 'Completed' });
    const fitnessTests = await FitnessRecord.countDocuments({
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalStudents,
      activeAthletes: activeAthletes[0]?.count || 0,
      upcomingEvents,
      completedEvents,
      fitnessTests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const events = await SportEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 },
          participants: { $sum: { $size: '$participants' } }
        }
      }
    ]);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFitnessAnalytics = async (req, res) => {
  try {
    const analytics = await FitnessRecord.aggregate([
      {
        $group: {
          _id: null,
          avgFitnessScore: { $avg: '$fitnessScore' },
          avgBMI: { $avg: '$bmi' },
          totalRecords: { $sum: 1 }
        }
      }
    ]);

    res.json(analytics[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getParticipationAnalytics = async (req, res) => {
  try {
    const participation = await SportEvent.aggregate([
      { $unwind: '$participants' },
      {
        $group: {
          _id: '$participants.studentId',
          eventsCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgParticipation: { $avg: '$eventsCount' },
          totalParticipants: { $sum: 1 }
        }
      }
    ]);

    res.json(participation[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Report Controllers
const generateEventReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const events = await SportEvent.find(query)
      .sort({ date: -1 });

    if (format === 'csv') {
      const csvData = events.map(event => ({
        'Event ID': event._id,
        'Title': event.title,
        'Sport': event.sport,
        'Date': event.date,
        'Venue': event.venue,
        'Status': event.status,
        'Participants': event.participants.length
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=events-report.csv');
      res.send(csvData);
    } else {
      res.json(events);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateFitnessReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await FitnessRecord.find(query)
      .populate('studentId', 'name class')
      .sort({ date: -1 });

    if (format === 'csv') {
      const csvData = records.map(record => ({
        'Record ID': record._id,
        'Student': record.studentId?.name || 'N/A',
        'Class': record.studentId?.class || 'N/A',
        'Height': record.height,
        'Weight': record.weight,
        'BMI': record.bmi,
        'Fitness Score': record.fitnessScore,
        'Date': record.date
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fitness-report.csv');
      res.send(csvData);
    } else {
      res.json(records);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateParticipationReport = async (req, res) => {
  try {
    const participation = await SportEvent.aggregate([
      { $unwind: '$participants' },
      {
        $group: {
          _id: '$participants.studentId',
          eventsCount: { $sum: 1 },
          events: { $push: '$title' }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      }
    ]);

    res.json(participation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tournament Management Controllers
const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate('teams', 'name')
      .sort({ startDate: -1 });
    
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams', 'name')
      .populate('matches.team1', 'name')
      .populate('matches.team2', 'name');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTournament = async (req, res) => {
  try {
    const tournament = new Tournament({
      ...req.body,
      organizerId: req.user.id
    });
    
    const newTournament = await tournament.save();
    res.status(201).json(newTournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTournamentMatch = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { $push: { matches: req.body } },
      { new: true }
    );
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTournamentMatch = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { $set: { [`matches.${req.params.matchId}`]: req.body } },
      { new: true }
    );
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Achievement Management Controllers
const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find()
      .populate('studentId', 'name class')
      .sort({ date: -1 });
    
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('studentId', 'name class');
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAchievement = async (req, res) => {
  try {
    const achievement = new Achievement({
      ...req.body,
      awardedBy: req.user.id
    });
    
    const newAchievement = await achievement.save();
    res.status(201).json(newAchievement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    res.json(achievement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Event Management
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  
  // Fitness Management
  getAllFitnessRecords,
  getFitnessRecordById,
  createFitnessRecord,
  updateFitnessRecord,
  deleteFitnessRecord,
  
  // Student Management
  getAllStudents,
  getStudentById,
  getStudentFitnessHistory,
  getStudentParticipation,
  
  // Team Management
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  
  // Equipment Management
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  updateEquipmentStatus,
  
  // Analytics
  getOverviewAnalytics,
  getEventAnalytics,
  getFitnessAnalytics,
  getParticipationAnalytics,
  
  // Reports
  generateEventReport,
  generateFitnessReport,
  generateParticipationReport,
  
  // Tournament Management
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  addTournamentMatch,
  updateTournamentMatch,
  
  // Achievement Management
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement
}; 