const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Maintenance = require('../models/Maintenance');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/maintenance
// @desc    Get all maintenance records
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { asset, status } = req.query;
    let query = {};

    if (asset) query.asset = asset;
    if (status) query.status = status;

    const maintenance = await Maintenance.find(query)
      .populate('asset', 'assetTag name category')
      .populate('vendor', 'name contactPerson')
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ startDate: -1 });

    res.json({ success: true, count: maintenance.length, data: maintenance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/maintenance
// @desc    Create maintenance record (Employees can request, Admin/IT Staff can create directly)
// @access  Private (All authenticated users)
router.post('/', protect, [
  body('asset').notEmpty().withMessage('Asset ID is required'),
  body('maintenanceType').isIn(['Repair', 'Preventive', 'Upgrade', 'Inspection']).withMessage('Invalid maintenance type'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const isEmployee = req.user.role === 'Employee';
    const maintenanceData = {
      ...req.body,
      requestedBy: isEmployee ? req.user.id : req.body.requestedBy,
      status: isEmployee ? 'Pending' : (req.body.status || 'Scheduled')
    };

    // Only Admin/IT Staff can set status to Scheduled directly
    if (isEmployee) {
      maintenanceData.status = 'Pending';
    }

    // Update asset status if needed (only for non-pending requests)
    if (maintenanceData.maintenanceType === 'Repair' && maintenanceData.status !== 'Pending') {
      await require('../models/Asset').findByIdAndUpdate(req.body.asset, {
        status: 'Under Repair'
      });
    }

    const maintenance = await Maintenance.create(maintenanceData);

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('asset', 'assetTag name category')
      .populate('vendor', 'name contactPerson')
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({ success: true, data: populatedMaintenance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance record
// @access  Private (Admin, IT Staff can update, Employees can only update their own pending requests)
router.put('/:id', protect, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Employees can only update their own pending requests
    const isEmployee = req.user.role === 'Employee';
    if (isEmployee) {
      if (maintenance.requestedBy?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this maintenance record' });
      }
      if (maintenance.status !== 'Pending') {
        return res.status(403).json({ message: 'Can only update pending maintenance requests' });
      }
      // Employees can only update description and notes for pending requests
      const updateData = {
        description: req.body.description,
        notes: req.body.notes
      };
      await Maintenance.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    } else {
      // Admin/IT Staff can update all fields
      await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    const updatedMaintenance = await Maintenance.findById(req.params.id)
      .populate('asset', 'assetTag name category')
      .populate('vendor', 'name contactPerson')
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name email');

    // Update asset status if maintenance completed
    if (updatedMaintenance.status === 'Completed' && updatedMaintenance.maintenanceType === 'Repair') {
      await require('../models/Asset').findByIdAndUpdate(updatedMaintenance.asset._id, {
        status: 'In Stock'
      });
    }

    // Update asset status if moving from Pending to Scheduled/In Progress for Repair
    if (updatedMaintenance.status !== 'Pending' && updatedMaintenance.maintenanceType === 'Repair') {
      const asset = await require('../models/Asset').findById(updatedMaintenance.asset._id);
      if (asset && asset.status !== 'Under Repair') {
        await require('../models/Asset').findByIdAndUpdate(updatedMaintenance.asset._id, {
          status: 'Under Repair'
        });
      }
    }

    res.json({ success: true, data: updatedMaintenance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/maintenance/:id/assign
// @desc    Assign/Approve maintenance request (Admin only)
// @access  Private (Admin only)
router.put('/:id/assign', protect, authorize('Admin'), [
  body('assignedTo').optional().notEmpty(),
  body('status').optional().isIn(['Scheduled', 'In Progress', 'Cancelled'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    const updateData = {
      ...req.body,
      status: req.body.status || 'Scheduled'
    };

    // Update asset status if moving to Scheduled/In Progress for Repair
    if (updateData.status !== 'Pending' && maintenance.maintenanceType === 'Repair') {
      await require('../models/Asset').findByIdAndUpdate(maintenance.asset, {
        status: 'Under Repair'
      });
    }

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('asset', 'assetTag name category')
      .populate('vendor', 'name contactPerson')
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json({ success: true, data: updatedMaintenance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
