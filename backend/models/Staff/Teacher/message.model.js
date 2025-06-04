const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel' },
  senderModel: { type: String, enum: ['Staff', 'Student', 'Parent'] },
  recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientModel' },
  recipientModel: { type: String, enum: ['Staff', 'Student', 'Parent'] },
  subject: String,
  content: String,
  isRead: { type: Boolean, default: false },
  attachments: [String]
}, { timestamps: true });

// Check if the model already exists before defining it
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);