const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: {
    type: String,
    enum: [
      'Teacher', 'HOD', 'VicePrincipal',
      'Principal', 'AdminStaff', 'ITAdmin', 'Counsellor', 'Accountant', "ClassCoord"
    ]
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      return ['Teacher', 'HOD'].includes(this.role);
    }
  },
  profileImage: String,
  contactNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  joiningDate: Date,
  qualification: String,
  experience: String,
  // New fields as requested
  dateOfBirth: Date,
  lastWorkingDate: Date,
  workingStatus: {
    type: String,
    enum: ['Working', 'Left'],
    default: 'Working'
  },
  remarks: String,
  workedSchools: [{
    schoolName: String,
    position: String,
    fromDate: Date,
    toDate: Date,
    reasonForLeaving: String
  }],
  supportingDocuments: [{
    documentType: {
      type: String,
      enum: ['qualification', 'experience', 'identity', 'other']
    },
    fileName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  designation: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  professionalDevelopment: [
    {
      title: String,
      institution: String,
      date: Date,
      duration: String,
      certificate: String,
      description: String
    }
  ],
  skills: [String],
  languages: [String],
  socialMedia: {
    linkedin: String,
    twitter: String,
    website: String
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'staff-only'], default: 'staff-only' },
      showContactInfo: { type: Boolean, default: false }
    }
  },
  // Add roles array to Staff schema
  roles: [{ type: String }],
  assignedSubjects: [
    {
      class: String,
      section: String,
      subject: String
    }
  ],
  assignedClasses: [
    {
      class: String,
      section: String
    }
  ],
  attendance: [
    {
      date: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day'],
        required: true
      },
      timeIn: String,
      timeOut: String,
      remarks: String,
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      markedAt: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      updatedAt: Date
    }
  ],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  subjects: [String],
  coordinator: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }]
}, {
  timestamps: true
});

// Hash password before saving
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  // Auto-generate an employeeId if missing (for staff records)
  if (!this.employeeId) {
    this.employeeId = `EMP-${Date.now().toString(36).toUpperCase()}`;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
staffSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;