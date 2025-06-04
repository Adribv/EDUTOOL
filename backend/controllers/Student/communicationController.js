const Student = require('../../models/Student/studentModel');
const Announcement = require('../../models/Communication/announcementModel');
const Message = require('../../models/Communication/messageModel');
const ClassDiscussion = require('../../models/Communication/classDiscussionModel');

// Get announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get announcements for all students or specific class
    const announcements = await Announcement.find({
      $or: [
        { targetAudience: 'All Students' },
        { 
          targetAudience: 'Specific Class',
          targetClass: student.class,
          targetSection: { $in: [student.section, 'All'] }
        }
      ],
      isPublished: true
    }).sort({ createdAt: -1 });
    
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get messages where student is recipient
    const messages = await Message.find({
      recipientId: student._id,
      recipientModel: 'Student'
    })
    .populate('senderId', 'name role')
    .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get message details
exports.getMessageDetails = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId)
      .populate('senderId', 'name role');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Verify this message is for this student
    if (message.recipientId.toString() !== req.user.id || message.recipientModel !== 'Student') {
      return res.status(403).json({ message: 'Not authorized to view this message' });
    }
    
    // Mark as read if not already
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error fetching message details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message reply
exports.sendMessageReply = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }
    
    // Verify this message is for this student
    if (originalMessage.recipientId.toString() !== req.user.id || originalMessage.recipientModel !== 'Student') {
      return res.status(403).json({ message: 'Not authorized to reply to this message' });
    }
    
    // Create reply message
    const replyMessage = new Message({
      senderId: req.user.id,
      senderModel: 'Student',
      recipientId: originalMessage.senderId,
      recipientModel: 'Staff', // Assuming original sender was staff
      subject: `Re: ${originalMessage.subject}`,
      content,
      parentMessageId: messageId
    });
    
    await replyMessage.save();
    
    res.status(201).json({ message: 'Reply sent successfully', replyMessage });
  } catch (error) {
    console.error('Error sending message reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get class discussions
exports.getClassDiscussions = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get discussions for student's class
    const discussions = await ClassDiscussion.find({
      class: student.class,
      section: student.section,
      isActive: true
    })
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 });
    
    res.json(discussions);
  } catch (error) {
    console.error('Error fetching class discussions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get discussion details
exports.getDiscussionDetails = async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    const discussion = await ClassDiscussion.findById(discussionId)
      .populate('createdBy', 'name role')
      .populate('comments.postedBy', 'name role');
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Verify this discussion is for student's class
    const student = await Student.findById(req.user.id);
    if (discussion.class !== student.class || discussion.section !== student.section) {
      return res.status(403).json({ message: 'Not authorized to view this discussion' });
    }
    
    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Post comment to discussion
exports.postDiscussionComment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    
    const discussion = await ClassDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Verify this discussion is for student's class
    const student = await Student.findById(req.user.id);
    if (discussion.class !== student.class || discussion.section !== student.section) {
      return res.status(403).json({ message: 'Not authorized to comment on this discussion' });
    }
    
    // Check if discussion is active
    if (!discussion.isActive) {
      return res.status(400).json({ message: 'This discussion is closed for comments' });
    }
    
    // Add comment
    discussion.comments.push({
      content,
      postedBy: student._id,
      postedAt: new Date()
    });
    
    await discussion.save();
    
    res.status(201).json({ message: 'Comment posted successfully', discussion });
  } catch (error) {
    console.error('Error posting discussion comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};