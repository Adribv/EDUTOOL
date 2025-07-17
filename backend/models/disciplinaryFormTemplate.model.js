const mongoose = require('mongoose');

const disciplinaryFormTemplateSchema = new mongoose.Schema({
  // Template metadata
  templateName: {
    type: String,
    required: true,
    default: 'Default Disciplinary Form Template'
  },
  templateDescription: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // School Information (editable by admin)
  schoolInfo: {
    schoolName: {
      type: String,
      required: true,
      default: 'School Name'
    },
    schoolAddress: String,
    schoolPhone: String,
    schoolEmail: String,
    logo: String // base64 or URL
  },
  
  // Form Configuration
  formConfig: {
    // Header settings
    showLogo: {
      type: Boolean,
      default: true
    },
    showDate: {
      type: Boolean,
      default: true
    },
    showWarningNumber: {
      type: Boolean,
      default: true
    },
    
    // Student Information fields
    studentFields: {
      requireParentContact: {
        type: Boolean,
        default: true
      },
      requireGradeSection: {
        type: Boolean,
        default: true
      },
      requireRollNumber: {
        type: Boolean,
        default: true
      }
    },
    
    // Incident Details fields
    incidentFields: {
      requireLocation: {
        type: Boolean,
        default: true
      },
      requireTime: {
        type: Boolean,
        default: true
      },
      requireReportingStaff: {
        type: Boolean,
        default: true
      }
    },
    
    // Workflow settings
    workflowSettings: {
      requireStudentAcknowledgment: {
        type: Boolean,
        default: true
      },
      requireParentAcknowledgment: {
        type: Boolean,
        default: true
      },
      requireAdminApproval: {
        type: Boolean,
        default: false
      },
      allowFollowUp: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Custom Misconduct Types (editable by admin)
  misconductTypes: [{
    label: {
      type: String,
      required: true
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  
  // Custom Action Types (editable by admin)
  actionTypes: [{
    label: {
      type: String,
      required: true
    },
    description: String,
    requiresDetails: Boolean, // e.g., suspension needs number of days
    detailsLabel: String, // e.g., "Number of days"
    severity: {
      type: String,
      enum: ['light', 'moderate', 'severe'],
      default: 'moderate'
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  
  // Custom Instructions/Guidelines
  instructions: {
    teacherInstructions: String,
    studentInstructions: String,
    parentInstructions: String,
    generalNotes: String
  },
  
  // Form Styling (basic customization)
  styling: {
    primaryColor: {
      type: String,
      default: '#1976d2'
    },
    fontFamily: {
      type: String,
      default: 'Arial, sans-serif'
    },
    logoPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left'
    }
  },
  
  // Template Management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  createdByName: String,
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  lastModifiedByName: String,
  
  // Usage statistics
  usageStats: {
    formsCreated: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only one default template
disciplinaryFormTemplateSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Default template data
disciplinaryFormTemplateSchema.statics.getDefaultTemplate = function() {
  return {
    templateName: 'Standard Disciplinary Form',
    templateDescription: 'Standard school disciplinary action form template',
    isActive: true,
    isDefault: true,
    schoolInfo: {
      schoolName: 'Your School Name',
      schoolAddress: 'School Address',
      schoolPhone: 'Phone Number',
      schoolEmail: 'email@school.edu'
    },
    misconductTypes: [
      { label: 'Disruptive Behavior in Class', severity: 'medium', enabled: true },
      { label: 'Disrespect Toward Staff', severity: 'high', enabled: true },
      { label: 'Physical Aggression', severity: 'high', enabled: true },
      { label: 'Inappropriate Language', severity: 'medium', enabled: true },
      { label: 'Bullying/Harassment', severity: 'high', enabled: true },
      { label: 'Vandalism', severity: 'high', enabled: true },
      { label: 'Cheating/Academic Dishonesty', severity: 'medium', enabled: true },
      { label: 'Skipping Classes Without Permission', severity: 'low', enabled: true }
    ],
    actionTypes: [
      { label: 'Verbal Warning', severity: 'light', enabled: true },
      { label: 'Written Warning', severity: 'moderate', enabled: true },
      { label: 'Parent Notification', severity: 'moderate', enabled: true },
      { label: 'Counseling Referral', severity: 'moderate', enabled: true },
      { label: 'Detention', severity: 'moderate', enabled: true },
      { 
        label: 'Suspension', 
        severity: 'severe', 
        requiresDetails: true, 
        detailsLabel: 'Number of days',
        enabled: true 
      }
    ]
  };
};

module.exports = mongoose.model('DisciplinaryFormTemplate', disciplinaryFormTemplateSchema); 