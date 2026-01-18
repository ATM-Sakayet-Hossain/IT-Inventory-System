const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
  licenseKey: {
    type: String,
    required: [true, 'Please add a license key'],
    unique: true,
    trim: true
  },
  softwareName: {
    type: String,
    required: [true, 'Please add software name'],
    trim: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  licenseType: {
    type: String,
    enum: ['Perpetual', 'Subscription', 'Open Source', 'Trial'],
    required: true
  },
  purchaseDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  cost: {
    type: Number
  },
  seats: {
    type: Number,
    default: 1
  },
  usedSeats: {
    type: Number,
    default: 0
  },
  assignedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Suspended', 'Unused'],
    default: 'Active'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('License', LicenseSchema);
