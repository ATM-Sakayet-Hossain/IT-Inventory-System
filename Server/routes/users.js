const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const users = await User.find({ isValid: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (All authenticated users)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user || !user.isValid) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin, IT Staff, or own profile)
router.put('/:id', protect, [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['Admin', 'IT Staff', 'Employee']),
  body('isActive').optional().isBoolean(),
  body('password').optional().isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is updating their own profile or is Admin/IT Staff
    const isOwnProfile = req.user.id === req.params.id;
    const isAuthorized = ['Admin', 'IT Staff'].includes(req.user.role);

    if (!isOwnProfile && !isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    // Get the user first
    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If updating own profile, restrict certain fields
    const updateData = { ...req.body };
    if (isOwnProfile && !isAuthorized) {
      // Users can't change their own role or active status
      delete updateData.role;
      delete updateData.isActive;
      delete updateData.email; // Email shouldn't be changed
    }

    // Handle password update
    if (updateData.password) {
      if (isOwnProfile) {
        // User changing their own password - set it directly
        user.password = updateData.password;
      } else if (isAuthorized) {
        // Admin changing another user's password
        user.password = updateData.password;
      } else {
        // Unauthorized password change
        delete updateData.password;
      }
    }

    // Update other fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.department) user.department = updateData.department;
    if (updateData.phone) user.phone = updateData.phone;
    if (isAuthorized && updateData.role) user.role = updateData.role;
    if (isAuthorized && updateData.isActive !== undefined) user.isActive = updateData.isActive;

    // Save the user (this will trigger the password hashing pre-save hook)
    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Soft delete user (set isValid to false)
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete - set isValid to false
    user.isValid = false;
    await user.save();
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
