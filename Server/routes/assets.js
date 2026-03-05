const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Asset = require('../models/Asset');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const QRCode = require('qrcode');

// @route   GET /api/assets
// @desc    Get all assets with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, assignedTo, search } = req.query;
    let query = { isValid: true };

    if (status) query.status = status;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { assetTag: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const assets = await Asset.find(query)
      .populate('category', 'name')
      .populate('vendor', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Asset.countDocuments(query);

    res.json({
      success: true,
      count: assets.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: assets
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assets/:id
// @desc    Get single asset
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category', 'name')
      .populate('vendor', 'name contactPerson email phone')
      .populate('assignedTo', 'name email department');

    if (!asset || !asset.isValid) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assets
// @desc    Create new asset
// @access  Private (Admin, IT Staff)
router.post('/', protect, authorize('Admin', 'IT Staff'), upload.single('image'), [
  body('assetTag').trim().notEmpty().withMessage('Asset tag is required'),
  body('name').trim().notEmpty().withMessage('Asset name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  body('purchasePrice').notEmpty().withMessage('Purchase cost is required').bail().isNumeric().withMessage('Purchase cost must be a number'),
  body('warranty.period').optional().isString().withMessage('Warranty must be a text value'),
  body('warranty.expiryDate').optional().isISO8601().withMessage('Warranty expiry date must be a valid date'),
  body('warranty.status').optional().isIn(['Active', 'Expired']).withMessage('Warranty status must be Active or Expired'),
  body('status').optional().isIn(['In Use', 'In Stock', 'Under Repair', 'Retired'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const assetData = req.body;
    if (req.file) {
      assetData.image = `/uploads/${req.file.filename}`;
    }

    // Generate QR code
    if (assetData.assetTag) {
      try {
        const qrCodeData = await QRCode.toDataURL(assetData.assetTag);
        assetData.qrCode = qrCodeData;
      } catch (err) {
        console.error('QR Code generation error:', err);
      }
    }

    const asset = await Asset.create(assetData);

    const populatedAsset = await Asset.findById(asset._id)
      .populate('category', 'name')
      .populate('vendor', 'name')
      .populate('assignedTo', 'name email');

    res.status(201).json({ success: true, data: populatedAsset });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Asset tag and serial number must be unique' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/assets/:id
// @desc    Update asset
// @access  Private (Admin, IT Staff)
router.put('/:id', protect, authorize('Admin', 'IT Staff'), upload.single('image'), [
  body('status').optional().isIn(['In Use', 'In Stock', 'Under Repair', 'Retired'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let assetData = req.body;
    if (req.file) {
      assetData.image = `/uploads/${req.file.filename}`;
    }

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      assetData,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('vendor', 'name')
      .populate('assignedTo', 'name email');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Asset tag and serial number must be unique' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/assets/:id
// @desc    Delete asset
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Soft delete - set isValid to false
    asset.isValid = false;
    await asset.save();
    
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assets/:id/assign
// @desc    Assign asset to user
// @access  Private (Admin, IT Staff)
router.post('/:id/assign', protect, authorize('Admin', 'IT Staff'), [
  body('assignedTo').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: req.body.assignedTo,
        assignedDate: new Date(),
        status: 'In Use'
      },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email department');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assets/:id/return
// @desc    Return asset
// @access  Private (Admin, IT Staff)
router.post('/:id/return', protect, authorize('Admin', 'IT Staff'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: null,
        assignedDate: null,
        status: 'In Stock'
      },
      { new: true, runValidators: true }
    );

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
