const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  returnDate: {
    type: Date
  },
  expectedReturnDate: {
    type: Date
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Lost', 'Damaged'],
    default: 'Active'
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
