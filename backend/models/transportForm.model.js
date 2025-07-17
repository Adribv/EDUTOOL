const mongoose = require('mongoose');

const transportFormSchema = new mongoose.Schema({
  // School Details
  schoolName: {
    type: String,
    required: true
  },
  departmentClass: String,
  dateOfRequest: {
    type: Date,
    default: Date.now
  },
  requestType: {
    regularSchoolCommute: { type: Boolean, default: false },
    educationalTrip: { type: Boolean, default: false },
    sportsEvent: { type: Boolean, default: false },
    culturalFieldVisit: { type: Boolean, default: false },
    emergencyTransport: { type: Boolean, default: false },
    other: { type: Boolean, default: false },
    otherDescription: String
  },

  // Student Information
  studentFullName: {
    type: String,
    required: true
  },
  gradeClassSection: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },

  // Parent/Guardian Information
  parentGuardianName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  pickupDropAddress: {
    type: String,
    required: true
  },

  // Transport Details
  pickupLocation: {
    type: String,
    required: true
  },
  dropLocation: {
    type: String,
    required: true
  },
  dateRequiredFrom: {
    type: Date,
    required: true
  },
  dateRequiredTo: {
    type: Date,
    required: true
  },
  pickupTime: {
    type: String,
    required: true
  },
  dropTime: {
    type: String,
    required: true
  },
  tripType: {
    type: String,
    enum: ['one-way', 'round-trip'],
    required: true
  },
  numberOfStudents: {
    type: Number,
    default: 1
  },
  purposeOfTransportation: {
    type: String,
    required: true
  },
  specialInstructions: String,

  // Authorization
  parentSignature: String, // base64 signature
  parentSignatureDate: Date,

  // School Transport Coordinator Approval
  coordinatorSignature: String, // base64 signature
  coordinatorSignatureDate: Date,
  coordinatorName: String,
  coordinatorComments: String,

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },

  // Created by (Admin/Staff)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  createdByName: String,
  createdByRole: String,

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
  },

  // Additional fields
  assignedVehicle: String,
  assignedDriver: String,
  driverContact: String,
  estimatedCost: Number,
  actualCost: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'waived'],
    default: 'pending'
  },

  // Workflow tracking
  submittedAt: Date,
  approvedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, { timestamps: true });

// Indexes for better query performance
transportFormSchema.index({ status: 1, createdAt: -1 });
transportFormSchema.index({ studentFullName: 1 });
transportFormSchema.index({ rollNumber: 1 });
transportFormSchema.index({ dateRequiredFrom: 1, dateRequiredTo: 1 });

module.exports = mongoose.model('TransportForm', transportFormSchema); 