const mongoose = require('mongoose');

const HardwareSpecificationsSchema = new mongoose.Schema(
  {
    ram: { type: String, trim: true },
    cpu: { type: String, trim: true },
    cpuGeneration: { type: String, trim: true },
    ssdSize: { type: String, trim: true },
    hddSize: { type: String, trim: true },
    motherboard: { type: String, trim: true },
    motherboardModel: { type: String, trim: true },
    gpu: { type: String, trim: true },
    macAddress: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    monitorSize: { type: String, trim: true }
  },
  { _id: false }
);

const AssignmentSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Free-text assignee name for manual assignments
  assignToName: {
    type: String,
    trim: true
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
  // Optional hardware snapshot at assignment time
  hardwareSpecifications: {
    type: HardwareSpecificationsSchema,
    required: false
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
