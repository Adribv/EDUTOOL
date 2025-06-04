const mongoose3 = require('mongoose');

const staffSchema = new mongoose3.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: [
      'Teacher', 'HOD', 'VicePrincipal',
      'Principal', 'AdminStaff', 'ITAdmin', 'Counsellor'
    ]
  },
  assignedSubjects: [
    {
      class: String,
      section: String,
      subject: String
    }
  ]
});

module.exports = mongoose3.model('Staff', staffSchema);