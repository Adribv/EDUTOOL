const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Literature', 'Technology', 'Arts', 'Sports', 'Biography', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  publishedYear: {
    type: Number
  },
  totalCopies: {
    type: Number,
    required: true,
    default: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 1
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Available', 'Limited', 'Unavailable'],
    default: 'Available'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

// Virtual for checking if book is available
bookSchema.virtual('isAvailable').get(function() {
  return this.availableCopies > 0;
});

// Method to update availability
bookSchema.methods.updateAvailability = function() {
  if (this.availableCopies === 0) {
    this.status = 'Unavailable';
  } else if (this.availableCopies < this.totalCopies) {
    this.status = 'Limited';
  } else {
    this.status = 'Available';
  }
  return this.save();
};

module.exports = mongoose.model('Book', bookSchema); 