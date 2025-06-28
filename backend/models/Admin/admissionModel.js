const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `APP${Date.now().toString(36).toUpperCase()}`
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  parentName: {
    type: String,
    required: true,
    trim: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  parentEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  applyingForClass: {
    type: String,
    required: true,
    enum: ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  academicYear: {
    type: String,
    required: true
  },
  previousSchool: {
    type: String,
    trim: true
  },
  documents: {
    birthCertificate: { type: Boolean, default: false },
    transferCertificate: { type: Boolean, default: false },
    reportCard: { type: Boolean, default: false },
    addressProof: { type: Boolean, default: false },
    parentIdProof: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Waitlisted'],
    default: 'Pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  admissionFee: {
    type: Number,
    default: 0
  },
  feePaid: {
    type: Boolean,
    default: false
  },
  feePaymentDate: {
    type: Date
  },
  enrollmentDate: {
    type: Date
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  specialRequirements: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalConditions: {
    type: String,
    trim: true
  },
  allergies: {
    type: String,
    trim: true
  },
  transportRequired: {
    type: Boolean,
    default: false
  },
  transportRoute: {
    type: String,
    trim: true
  },
  hostelRequired: {
    type: Boolean,
    default: false
  },
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date
  },
  interviewNotes: {
    type: String,
    trim: true
  },
  testScore: {
    type: Number,
    min: 0,
    max: 100
  },
  testDate: {
    type: Date
  },
  waitlistPosition: {
    type: Number
  },
  waitlistDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  reapplicationEligible: {
    type: Boolean,
    default: true
  },
  reapplicationDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
admissionSchema.index({ status: 1, applicationDate: -1 });
admissionSchema.index({ applyingForClass: 1, status: 1 });
admissionSchema.index({ parentEmail: 1 });
admissionSchema.index({ parentPhone: 1 });

// Virtual for age calculation
admissionSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for application duration
admissionSchema.virtual('applicationDuration').get(function() {
  if (!this.applicationDate) return null;
  const today = new Date();
  const appDate = new Date(this.applicationDate);
  const diffTime = Math.abs(today - appDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to update waitlist position
admissionSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'Waitlisted') {
    const waitlistCount = await this.constructor.countDocuments({ 
      status: 'Waitlisted', 
      applyingForClass: this.applyingForClass 
    });
    this.waitlistPosition = waitlistCount + 1;
    this.waitlistDate = new Date();
  }
  next();
});

// Static method to get admission statistics
admissionSchema.statics.getAdmissionStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalFee: { $sum: '$admissionFee' }
      }
    }
  ]);
  
  const totalApplications = await this.countDocuments();
  const pendingApplications = await this.countDocuments({ status: 'Pending' });
  const approvedApplications = await this.countDocuments({ status: 'Approved' });
  const rejectedApplications = await this.countDocuments({ status: 'Rejected' });
  
  return {
    total: totalApplications,
    pending: pendingApplications,
    approved: approvedApplications,
    rejected: rejectedApplications,
    byStatus: stats
  };
};

// Static method to get admissions by class
admissionSchema.statics.getAdmissionsByClass = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$applyingForClass',
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
        },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Admission', admissionSchema); 