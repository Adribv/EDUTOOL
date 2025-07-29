const mongoose = require('mongoose');

const disciplinaryFormSchema = new mongoose.Schema({
  // Template Reference
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DisciplinaryFormTemplate',
    required: true
  },
  
  // Template fields (filled by admin/auto-populated from template)
  schoolName: String,
  date: {
    type: Date,
    default: Date.now
  },
  warningNumber: String,
  
  // Student Information
  studentName: String,
  grade: String,
  section: String,
  rollNumber: String,
  parentGuardianName: String,
  contactNumber: String,
  
  // Incident Details
  dateOfIncident: Date,
  timeOfIncident: String,
  location: String,
  reportingStaffName: String,
  descriptionOfIncident: String,
  
  // Dynamic Misconduct Types (based on template)
  selectedMisconductTypes: [{
    misconductId: String, // ID from template
    label: String,
    selected: Boolean,
    description: String // for "other" type
  }],
  
  // Dynamic Action Types (based on template)
  selectedActionTypes: [{
    actionId: String, // ID from template
    label: String,
    selected: Boolean,
    details: String, // for actions requiring details (e.g., number of days)
    description: String // for "other" type
  }],
  
  // Legacy fields for backward compatibility
  typeOfMisconduct: {
    disruptiveBehaviorInClass: Boolean,
    disrespectTowardStaff: Boolean,
    physicalAggression: Boolean,
    inappropriateLanguage: Boolean,
    bullyingHarassment: Boolean,
    vandalism: Boolean,
    cheatingAcademicDishonesty: Boolean,
    skippingClassesWithoutPermission: Boolean,
    other: Boolean,
    otherDescription: String
  },
  
  // Legacy action fields for backward compatibility  
  actionTaken: {
    verbalWarning: Boolean,
    writtenWarning: Boolean,
    parentNotification: Boolean,
    counselingReferral: Boolean,
    detention: Boolean,
    suspension: {
      selected: Boolean,
      numberOfDays: Number
    },
    other: Boolean,
    otherDescription: String
  },
  
  // Created by (Teacher/Admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  createdByName: String,
  createdByRole: String,
  
  // Student Acknowledgment
  studentAcknowledgment: {
    acknowledged: Boolean,
    signature: String, // base64 signature
    date: Date,
    comments: String
  },
  
  // Parent Acknowledgment
  parentAcknowledgment: {
    acknowledged: Boolean,
    signature: String, // base64 signature
    date: Date,
    comments: String,
    parentName: String
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'submitted', 'awaitingStudentAck', 'awaitingParentAck', 'completed'],
    default: 'draft'
  },
  
  // Workflow tracking
  submittedAt: Date,
  studentNotifiedAt: Date,
  parentNotifiedAt: Date,
  completedAt: Date,
  
  // Additional fields
  followUpRequired: Boolean,
  followUpDate: Date,
  followUpNotes: String,
  
  // Admin approval (if required by template)
  adminApproval: {
    approved: Boolean,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    approvedAt: Date,
    comments: String
  },
  
  // PDF Storage
  pdfFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    generatedAt: Date,
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  }
}, { timestamps: true });

// Populate template on find
disciplinaryFormSchema.pre(/^find/, function(next) {
  this.populate('template');
  next();
});

module.exports = mongoose.model('DisciplinaryForm', disciplinaryFormSchema); 