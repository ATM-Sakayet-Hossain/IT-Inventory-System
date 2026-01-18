const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/vendors
// @desc    Get all vendors (only valid ones)
// @access  Private (Admin only)
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const vendors = await Vendor.find({ isValid: true }).sort({ name: 1 });
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/vendors
// @desc    Create vendor
// @access  Private (Admin only)
router.post('/', protect, authorize('Admin'), [
  body('name').trim().notEmpty().withMessage('Vendor name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/vendors/:id
// @desc    Update vendor
// @access  Private (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/vendors/:id
// @desc    Soft delete vendor (set isValid to false)
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Soft delete - set isValid to false
    vendor.isValid = false;
    await vendor.save();
    
    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
