const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: String,
  contactNumber: String,
  admissionNumber: String,
  admissionSource: String,
  admissionTransferTo: String,
  courseDuration: String,
  category: String,
  religion: String,
  educationQualification: String,
  bloodGroup: String,
  studentPhoto: String,
  idProof: String,
  addressProof: String,
  admissionSession: String,
  studentDomicile: String,
  grandTotalFee: String,
  applicableDiscount: String,
  fatherName: String,
  fatherMobile: String,
  fatherOccupation: String,
  motherName: String,
  motherMobile: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  }],
  profilePhoto: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Graduated'],
    default: 'Active'
  },
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String
  },
  
  // Disciplinary Actions
  disciplinaryActions: [{
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisciplinaryForm'
    },
    date: {
      type: Date,
      default: Date.now
    },
    incident: String,
    actionTaken: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    createdByName: String,
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'resolved'],
      default: 'pending'
    },
    studentResponse: String,
    parentResponse: String,
    teacherNotified: {
      type: Boolean,
      default: false
    },
    parentNotified: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);