const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['Admin', 'IT Staff', 'Employee'],
    default: 'Employee'
  },
  department: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  // Custom permissions for fine-grained access control
  permissions: {
    // Module access permissions
    modules: {
      dashboard: { type: Boolean, default: false },
      assets: { type: Boolean, default: false },
      users: { type: Boolean, default: false },
      categories: { type: Boolean, default: false },
      vendors: { type: Boolean, default: false },
      assignments: { type: Boolean, default: false },
      maintenance: { type: Boolean, default: false },
      licenses: { type: Boolean, default: false },
      reports: { type: Boolean, default: false }
    },
    // Action-level permissions
    actions: {
      canCreate: { type: Boolean, default: false },
      canRead: { type: Boolean, default: false },
      canUpdate: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false },
      canApprove: { type: Boolean, default: false }
    },
    // Resource-specific permissions
    resources: {
      canManageUsers: { type: Boolean, default: false },
      canManageVendors: { type: Boolean, default: false },
      canManageAssets: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canApproveRequests: { type: Boolean, default: false }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
