const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  contactPerson: String,
  phone: String,
  email: String,
  location: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema); 