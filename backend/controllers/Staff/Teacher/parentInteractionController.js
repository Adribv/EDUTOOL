const Meeting = require('../../../models/Staff/Teacher/meeting.model');
const ParentCommunication = require('../../../models/Staff/Teacher/parentCommunication.model');
const ProgressUpdate = require('../../../models/Staff/Teacher/progressUpdate.model');

// Get all parent-teacher meetings
exports.getParentMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      'attendees.id': req.user.id,
      'attendees.role': 'Teacher'
    }).populate('attendees.id', 'name email');
    
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching parent meetings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record a communication with a parent
exports.recordCommunication = async (req, res) => {
  try {
    const { 
      parentId, 
      studentId, 
      date, 
      communicationType, 
      subject, 
      details, 
      outcome, 
      followUpRequired, 
      followUpDate 
    } = req.body;
    
    const communication = new ParentCommunication({
      parentId,
      studentId,
      teacherId: req.user.id,
      date: date || new Date(),
      communicationType,
      subject,
      details,
      outcome,
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : null
    });
    
    await communication.save();
    res.status(201).json({ message: 'Communication recorded successfully', communication });
  } catch (error) {
    console.error('Error recording communication:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get communication history with a specific parent
exports.getCommunicationHistory = async (req, res) => {
  try {
    const communications = await ParentCommunication.find({
      parentId: req.params.parentId,
      teacherId: req.user.id
    }).sort({ date: -1 });
    
    res.json(communications);
  } catch (error) {
    console.error('Error fetching communication history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Document a concern raised by a parent
exports.documentConcern = async (req, res) => {
  try {
    const { 
      parentId, 
      studentId, 
      date, 
      communicationType, 
      subject, 
      details, 
      outcome, 
      followUpRequired, 
      followUpDate 
    } = req.body;
    
    const concern = new ParentCommunication({
      parentId,
      studentId,
      teacherId: req.user.id,
      date: date || new Date(),
      communicationType,
      subject,
      details,
      outcome,
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : null
    });
    
    await concern.save();
    res.status(201).json({ message: 'Parent concern documented successfully', concern });
  } catch (error) {
    console.error('Error documenting parent concern:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add follow-up to a documented concern
exports.addFollowUp = async (req, res) => {
  try {
    const { followUpDetails, followUpCompleted } = req.body;
    
    const concern = await ParentCommunication.findOne({
      _id: req.params.concernId,
      teacherId: req.user.id,
      followUpRequired: true
    });
    
    if (!concern) {
      return res.status(404).json({ message: 'Concern not found or follow-up not required' });
    }
    
    concern.followUpDetails = followUpDetails;
    concern.followUpCompleted = followUpCompleted;
    
    await concern.save();
    res.json({ message: 'Follow-up added successfully', concern });
  } catch (error) {
    console.error('Error adding follow-up:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a progress update to a parent
exports.sendProgressUpdate = async (req, res) => {
  try {
    const { parentId, studentId, subject, content } = req.body;
    
    const progressUpdate = new ProgressUpdate({
      parentId,
      studentId,
      teacherId: req.user.id,
      subject,
      content,
      attachmentUrl: req.file ? `/uploads/resources/${req.file.filename}` : null
    });
    
    await progressUpdate.save();
    res.status(201).json({ message: 'Progress update sent successfully', progressUpdate });
  } catch (error) {
    console.error('Error sending progress update:', error);
    res.status(500).json({ message: 'Server error' });
  }
};