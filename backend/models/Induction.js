const mongoose = require('mongoose');

const InductionSchema = new mongoose.Schema({
  induction: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: String, // or Date if you want to store as Date object
    required: true
  },
  endDate: {
    type: String, // or Date if you want to store as Date object
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Induction', InductionSchema);