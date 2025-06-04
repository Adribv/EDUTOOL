const Message = require('../../../models/Staff/Teacher/message.model');
const Announcement = require('../../../models/Staff/Teacher/announcement.model');
const Meeting = require('../../../models/Staff/Teacher/meeting.model');
const Staff = require('../../../models/Staff/staffModel');
const Student = require('../../../models/Student/studentModel');
const Parent = require('../../../models/Parent/parentModel');

// Send message to student or parent
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, recipientModel, subject, content } = req.body;
    const attachments = req.files ? req.files.map(file => file.path) : [];
    
    const message = new Message({
      sender: req.user.id,
      senderModel: 'Staff',
      recipient: recipientId,
      recipientModel,
      subject,
      content,
      attachments
    });
    
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get received messages
exports.getReceivedMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      recipient: req.user.id,
      recipientModel: 'Staff'
    }).populate('sender', 'name email');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sent messages
exports.getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      sender: req.user.id,
      senderModel: 'Staff'
    }).populate('recipient', 'name email');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post announcement to class
exports.postAnnouncement = async (req, res) => {
  try {
    const { title, content, class: cls, section } = req.body;
    const attachments = req.files ? req.files.map(file => file.path) : [];
    
    // Check if teacher is assigned to this class
    const staff = await Staff.findById(req.user.id);
    const isAssigned = staff.assignedSubjects.some(
      subject => subject.class === cls && subject.section === section
    );
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }
    
    const announcement = new Announcement({
      title,
      content,
      class: cls,
      section,
      postedBy: req.user.id,
      attachments
    });
    
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get announcements posted by teacher
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ postedBy: req.user.id });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Schedule parent-teacher meeting
exports.scheduleMeeting = async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, location, parentId } = req.body;
    
    const meeting = new Meeting({
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      meetingWith: 'Parent',
      participants: [{
        participantId: parentId,
        participantModel: 'Parent'
      }],
      organizer: req.user.id
    });
    
    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get scheduled meetings
exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ organizer: req.user.id })
      .populate('participants.participantId', 'name email');
    
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};