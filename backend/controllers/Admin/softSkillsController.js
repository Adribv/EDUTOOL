const Event = require('../../models/Admin/eventModel');
const ExtracurricularAchievement = require('../../models/Staff/Teacher/extracurricularAchievement.model');
const Student = require('../../models/Student/studentModel');

// Create event/club/competition/cultural
exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all events (optionally filter by category)
exports.getAllEvents = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const events = await Event.find(filter).sort({ startDate: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add participant
exports.addParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { participant } = req.body;
    const event = await Event.findById(id);
    if (!event.participants.includes(participant)) event.participants.push(participant);
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove participant
exports.removeParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { participant } = req.body;
    const event = await Event.findById(id);
    event.participants = event.participants.filter(p => p !== participant);
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Log skill development for a student
exports.logSkill = async (req, res) => {
  try {
    const { studentName, title, description, date, category, level, position, certificateUrl } = req.body;
    const achievement = new ExtracurricularAchievement({ studentName, title, description, date, category, level, position, certificateUrl });
    await achievement.save();
    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all skill logs (optionally filter by student)
exports.getAllSkillLogs = async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = studentId ? { studentName: studentId } : {};
    const logs = await ExtracurricularAchievement.find(filter);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await ExtracurricularAchievement.find().sort({ date: -1 });
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 