const mongoose = require('mongoose');

const HardwareSpecificationsSchema = new mongoose.Schema(
  {
    ram: {
      type: String,
      trim: true
    },
    cpu: {
      type: String,
      trim: true
    },
    cpuGeneration: {
      type: String,
      trim: true
    },
    ssdSize: {
      type: String,
      trim: true
    },
    hddSize: {
      type: String,
      trim: true
    },
    motherboard: {
      type: String,
      trim: true
    },
    motherboardModel: {
      type: String,
      trim: true
    },
    gpu: {
      type: String,
      trim: true
    },
    macAddress: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    monitorSize: {
      type: String,
      trim: true
    }
  },
  {
    _id: false
  }
);

const WarrantySchema = new mongoose.Schema(
  {
    period: {
      type: String,
      trim: true
    },
    purchaseDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Active', 'Expired'],
      default: 'Active'
    }
  },
  {
    _id: false
  }
);

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
  purchasePrice: {
    type: Number
  },
  purchaseDate: {
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
  hardwareSpecifications: {
    type: HardwareSpecificationsSchema,
    required: false
  },
  warranty: {
    type: WarrantySchema,
    required: false
  },
  remarks: {
    type: String,
    trim: true
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
