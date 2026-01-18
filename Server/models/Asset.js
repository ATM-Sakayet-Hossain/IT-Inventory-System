const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  assetTag: {
    type: String,
    required: [true, 'Please add an asset tag'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Please add an asset name'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['In Use', 'In Stock', 'Under Repair', 'Retired'],
    default: 'In Stock'
  },
  location: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number
  },
  warrantyExpiry: {
    type: Date
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  barcode: {
    type: String
  },
  qrCode: {
    type: String
  },
  specifications: {
    type: Map,
    of: String
  },
  isValid: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate asset tag if not provided
AssetSchema.pre('save', async function(next) {
  if (!this.assetTag) {
    const count = await mongoose.model('Asset').countDocuments();
    this.assetTag = `AST-${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Asset', AssetSchema);
