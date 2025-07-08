const mongoose = require('mongoose');

const supplyRequestSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: String,
  quantity: { type: Number, required: true },
  unit: String,
  expectedDate: Date,
  quotation: String,
  message: String,
  supplier: { type: String, ref: 'Supplier' },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Received', 'Delayed'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('SupplyRequest', supplyRequestSchema); 