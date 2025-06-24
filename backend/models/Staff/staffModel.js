const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: [
      'Teacher', 'HOD', 'VicePrincipal',
      'Principal', 'AdminStaff', 'ITAdmin', 'Counsellor', "ClassCoord"
    ]
  },
  department: {
    type: String,
    required: function() {
      return ['Teacher', 'HOD'].includes(this.role);
    }
  },
  profileImage: String,
  contactNumber: String,
  address: String,
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  joiningDate: Date,
  qualification: String,
  experience: String,
  assignedSubjects: [
    {
      class: String,
      section: String,
      subject: String
    }
  ]
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