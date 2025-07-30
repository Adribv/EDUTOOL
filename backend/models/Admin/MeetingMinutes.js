const mongoose = require('mongoose');

// Sub-schema for agenda items
const agendaItemSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: true
  },
  agendaItem: {
    type: String,
    required: true,
    trim: true
  },
  discussionSummary: {
    type: String,
    required: true,
    trim: true
  },
  decisionsTaken: {
    type: String,
    required: true,
    trim: true
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
});

// Sub-schema for action items
const actionItemSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: true
  },
  actionItem: {
    type: String,
    required: true,
    trim: true
  },
  responsiblePerson: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Not Started'
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
});

const meetingMinutesSchema = new mongoose.Schema({
  // Meeting Details Section
  meetingTitle: {
    type: String,
    required: true,
    trim: true
  },
  meetingDate: {
    type: Date,
    required: true
  },
  meetingTime: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  chairperson: {
    type: String,
    required: true,
    trim: true
  },
  recorder: {
    type: String,
    required: true,
    trim: true
  },
  attendees: [{
    type: String,
    trim: true
  }],
  apologies: [{
    type: String,
    trim: true
  }],

  // Agenda Items & Discussions Section
  agendaItems: [agendaItemSchema],

  // Action Log Section
  actionItems: [actionItemSchema],

  // Signature Section
  chairpersonSignature: {
    type: String,
    trim: true,
    default: ''
  },
  signatureDate: {
    type: Date,
    default: Date.now
  },

  // Approval Section
  approvalStatus: {
    type: String,
    required: true,
    enum: ['Draft', 'Submitted', 'VP Approved', 'Principal Approved', 'Rejected'],
    default: 'Draft'
  },
  vpApproval: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    approvedAt: Date,
    remarks: String
  },
  principalApproval: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    approvedAt: Date,
    remarks: String
  },

  // Additional fields for tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  meetingNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  meetingType: {
    type: String,
    required: true,
    enum: ['Academic', 'Administrative', 'Staff', 'Parent-Teacher', 'Board', 'Other'],
    default: 'Administrative'
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
meetingMinutesSchema.index({ meetingDate: -1 });
meetingMinutesSchema.index({ meetingNumber: 1 }, { unique: true });
meetingMinutesSchema.index({ approvalStatus: 1 });
meetingMinutesSchema.index({ createdBy: 1 });
meetingMinutesSchema.index({ meetingType: 1 });
meetingMinutesSchema.index({ chairperson: 1 });

// Auto-generate meeting number
meetingMinutesSchema.pre('save', async function(next) {
  if (this.isNew && !this.meetingNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const lastMeeting = await this.constructor.findOne({}, {}, { sort: { 'meetingNumber': -1 } });
    
    if (lastMeeting && lastMeeting.meetingNumber) {
      const lastNumber = parseInt(lastMeeting.meetingNumber.split('-')[2]) || 0;
      this.meetingNumber = `MM-${year}${month}-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      this.meetingNumber = `MM-${year}${month}-0001`;
    }
  }
  next();
});

// Auto-number agenda items
meetingMinutesSchema.pre('save', function(next) {
  if (this.agendaItems && this.agendaItems.length > 0) {
    this.agendaItems.forEach((item, index) => {
      item.serialNumber = index + 1;
    });
  }
  next();
});

// Auto-number action items
meetingMinutesSchema.pre('save', function(next) {
  if (this.actionItems && this.actionItems.length > 0) {
    this.actionItems.forEach((item, index) => {
      item.serialNumber = index + 1;
    });
  }
  next();
});

module.exports = mongoose.model('MeetingMinutes', meetingMinutesSchema); 