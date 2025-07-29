const express = require('express');
const router = express.Router();
const ptTeacherController = require('../../controllers/Staff/PTTeacher/ptTeacherController');
const { permit } = require('../../middleware/permit');

// Apply role-based middleware to all routes
router.use(permit(['ptteacher', 'admin']));

// Sports Event Management Routes
router.get('/events', ptTeacherController.getAllEvents);
router.get('/events/:id', ptTeacherController.getEventById);
router.post('/events', ptTeacherController.createEvent);
router.put('/events/:id', ptTeacherController.updateEvent);
router.delete('/events/:id', ptTeacherController.deleteEvent);
router.patch('/events/:id/status', ptTeacherController.updateEventStatus);

// Fitness Assessment Routes
router.get('/fitness-records', ptTeacherController.getAllFitnessRecords);
router.get('/fitness-records/:id', ptTeacherController.getFitnessRecordById);
router.post('/fitness-records', ptTeacherController.createFitnessRecord);
router.put('/fitness-records/:id', ptTeacherController.updateFitnessRecord);
router.delete('/fitness-records/:id', ptTeacherController.deleteFitnessRecord);

// Student Management Routes
router.get('/students', ptTeacherController.getAllStudents);
router.get('/students/:id', ptTeacherController.getStudentById);
router.get('/students/:id/fitness-history', ptTeacherController.getStudentFitnessHistory);
router.get('/students/:id/participation', ptTeacherController.getStudentParticipation);

// Sports Team Management Routes
router.get('/teams', ptTeacherController.getAllTeams);
router.get('/teams/:id', ptTeacherController.getTeamById);
router.post('/teams', ptTeacherController.createTeam);
router.put('/teams/:id', ptTeacherController.updateTeam);
router.delete('/teams/:id', ptTeacherController.deleteTeam);
router.post('/teams/:id/members', ptTeacherController.addTeamMember);
router.delete('/teams/:id/members/:studentId', ptTeacherController.removeTeamMember);

// Equipment Management Routes
router.get('/equipment', ptTeacherController.getAllEquipment);
router.get('/equipment/:id', ptTeacherController.getEquipmentById);
router.post('/equipment', ptTeacherController.createEquipment);
router.put('/equipment/:id', ptTeacherController.updateEquipment);
router.delete('/equipment/:id', ptTeacherController.deleteEquipment);
router.patch('/equipment/:id/status', ptTeacherController.updateEquipmentStatus);

// Analytics and Reports Routes
router.get('/analytics/overview', ptTeacherController.getOverviewAnalytics);
router.get('/analytics/events', ptTeacherController.getEventAnalytics);
router.get('/analytics/fitness', ptTeacherController.getFitnessAnalytics);
router.get('/analytics/participation', ptTeacherController.getParticipationAnalytics);
router.get('/reports/events', ptTeacherController.generateEventReport);
router.get('/reports/fitness', ptTeacherController.generateFitnessReport);
router.get('/reports/participation', ptTeacherController.generateParticipationReport);

// Tournament Management Routes
router.get('/tournaments', ptTeacherController.getAllTournaments);
router.get('/tournaments/:id', ptTeacherController.getTournamentById);
router.post('/tournaments', ptTeacherController.createTournament);
router.put('/tournaments/:id', ptTeacherController.updateTournament);
router.delete('/tournaments/:id', ptTeacherController.deleteTournament);
router.post('/tournaments/:id/matches', ptTeacherController.addTournamentMatch);
router.put('/tournaments/:id/matches/:matchId', ptTeacherController.updateTournamentMatch);

// Achievement and Awards Routes
router.get('/achievements', ptTeacherController.getAllAchievements);
router.get('/achievements/:id', ptTeacherController.getAchievementById);
router.post('/achievements', ptTeacherController.createAchievement);
router.put('/achievements/:id', ptTeacherController.updateAchievement);
router.delete('/achievements/:id', ptTeacherController.deleteAchievement);

module.exports = router; 