const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const License = require('../models/License');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/licenses
// @desc    Get all licenses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, softwareName } = req.query;
    let query = {};

    if (status) query.status = status;
    if (softwareName) {
      query.softwareName = { $regex: softwareName, $options: 'i' };
    }

    const licenses = await License.find(query)
      .populate('vendor', 'name contactPerson')
      .populate('assignedTo.user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: licenses.length, data: licenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/licenses
// @desc    Create license
// @access  Private (Admin, IT Staff)
router.post('/', protect, authorize('Admin', 'IT Staff'), [
  body('licenseKey').trim().notEmpty().withMessage('License key is required'),
  body('softwareName').trim().notEmpty().withMessage('Software name is required'),
  body('licenseType').isIn(['Perpetual', 'Subscription', 'Open Source', 'Trial']).withMessage('Invalid license type')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const license = await License.create(req.body);

    const populatedLicense = await License.findById(license._id)
      .populate('vendor', 'name contactPerson');

    res.status(201).json({ success: true, data: populatedLicense });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License key already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/licenses/:id/assign
// @desc    Assign license to user
// @access  Private (Admin, IT Staff)
router.post('/:id/assign', protect, authorize('Admin', 'IT Staff'), [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const license = await License.findById(req.params.id);
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    // Check if user already assigned
    const alreadyAssigned = license.assignedTo.some(
      assignment => assignment.user.toString() === req.body.userId
    );

    if (alreadyAssigned) {
      return res.status(400).json({ message: 'License already assigned to this user' });
    }

    // Check available seats
    if (license.usedSeats >= license.seats) {
      return res.status(400).json({ message: 'No available seats for this license' });
    }

    license.assignedTo.push({
      user: req.body.userId,
      assignedDate: new Date()
    });
    license.usedSeats += 1;
    await license.save();

    const populatedLicense = await License.findById(license._id)
      .populate('vendor', 'name contactPerson')
      .populate('assignedTo.user', 'name email');

    res.json({ success: true, data: populatedLicense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/licenses/:id
// @desc    Update license
// @access  Private (Admin, IT Staff)
router.put('/:id', protect, authorize('Admin', 'IT Staff'), async (req, res) => {
  try {
    const license = await License.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('vendor', 'name contactPerson')
      .populate('assignedTo.user', 'name email');

    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    res.json({ success: true, data: license });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
