const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  arrivalTime: String,
  departureTime: String,
  sequence: Number
});

const studentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  name: String,
  rollNumber: String,
  class: String,
  section: String,
  pickupStop: String,
  dropStop: String
});

const maintenanceSchema = new mongoose.Schema({
  maintenanceType: {
    type: String,
    required: true,
    enum: ['Regular Service', 'Repair', 'Inspection', 'Other']
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: Date,
  description: String,
  cost: Number,
  vendor: String,
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
});

const scheduleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: String,
  endTime: String,
  route: String,
  driver: String
});

const fuelLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  liters: Number,
  cost: Number,
  filledBy: String
});

const driverIncidentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  description: String,
  actionTaken: String
});

const transportSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Bus', 'Van', 'Car', 'Other']
  },
  capacity: {
    type: Number,
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverContact: {
    type: String,
    required: true
  },
  driverLicense: {
    type: String,
    required: true
  },
  routeNumber: {
    type: String,
    required: true
  },
  routeDescription: String,
  stops: [stopSchema],
  students: [studentSchema],
  maintenanceSchedule: [maintenanceSchema],
  status: {
    type: String,
    enum: ['Active', 'Under Maintenance', 'Inactive'],
    default: 'Active'
  },
  schedules: [scheduleSchema],
  fuelLogs: [fuelLogSchema],
  driverIncidents: [driverIncidentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);