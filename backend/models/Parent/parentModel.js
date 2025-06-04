const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  childRollNumbers: [{ type: String }] // link by rollNumber
});

module.exports = mongoose.model('Parent', parentSchema);