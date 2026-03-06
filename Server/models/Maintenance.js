const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  maintenanceType: {
    type: String,
    enum: ['Repair', 'Preventive', 'Upgrade', 'Inspection'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  performedBy: {
    type: String,
    trim: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  cost: {
    type: Number
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    trim: true
  },
  nextMaintenanceDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes to speed up maintenance list and filter queries
MaintenanceSchema.index({ asset: 1, status: 1, startDate: -1 });
MaintenanceSchema.index({ status: 1, startDate: -1 });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
