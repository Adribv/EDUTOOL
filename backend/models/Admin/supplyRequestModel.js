const mongoose = require('mongoose');

const supplyRequestSchema = new mongoose.Schema(
  {
    // Legacy single-item fields (kept for backward compatibility)
    itemName: { type: String, required: false },
    category: String,
    quantity: Number,
    unit: String,

    // New multi-item stationery request layout
    requestRef: String,
    name: String, // requester name on form header
    department: String,
    date: Date,
    notes: String,

    items: [
      {
        itemCode: String,
        description: String,
        specification: String,
        unit: String,
        qty: Number,
        remarks: String,
      },
    ],

    requesterName: String,
    idNo: String,
    approvedBy: String,
    approvedDate: Date,

    expectedDate: Date,
    quotation: String,
    message: String,
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Received', 'Delayed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupplyRequest', supplyRequestSchema); 