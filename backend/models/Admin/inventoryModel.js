const mongoose = require('mongoose');

const issueRecordSchema = new mongoose.Schema({
  issuedTo: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expectedReturnDate: Date,
  actualReturnDate: Date,
  purpose: String,
  remarks: String,
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Partially Returned', 'Lost'],
    default: 'Issued'
  }
});

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Stationery', 'Classroom Materials', 'Sports Equipment', 'Lab Supplies', 'Maintenance', 'Other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  supplier: {
    name: String,
    contactNumber: String,
    email: String
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  location: String,
  minimumStockLevel: {
    type: Number,
    default: 10
  },
  description: String,
  status: {
    type: String,
    enum: ['Available', 'Low Stock', 'Out of Stock', 'Discontinued'],
    default: 'Available'
  },
  issueRecords: [issueRecordSchema]
}, { timestamps: true });

// Update status based on quantity and minimumStockLevel
inventorySchema.pre('save', function(next) {
  if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minimumStockLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Available';
  }
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);