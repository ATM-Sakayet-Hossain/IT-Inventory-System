const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    let query = {};

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const assignments = await Assignment.find(query)
      .populate('asset', 'assetTag name category status')
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email')
      .sort({ assignedDate: -1 });

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assignments
// @desc    Create assignment (supports either user ID or free-text assignee name)
// @access  Private (Admin, IT Staff)
router.post('/', protect, authorize('Admin', 'IT Staff'), [
  body('asset').notEmpty().withMessage('Asset ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { asset, assignedTo, assignToName, expectedReturnDate, condition, notes, hardwareSpecifications, assignedDate } = req.body;

  // Require at least one assignee identifier
  if (!assignedTo && !assignToName) {
    return res.status(400).json({ message: 'Either assignedTo (user ID) or assignToName (free-text) is required' });
  }

  try {
    const now = new Date();

    // Update asset status; only set assignedTo when a user ID is provided
    const assetUpdate = {
      status: 'In Use',
      assignedDate: now
    };

    if (assignedTo) {
      assetUpdate.assignedTo = assignedTo;
    }

    await Asset.findByIdAndUpdate(asset, assetUpdate);

    const assignmentData = {
      asset,
      assignedTo: assignedTo || undefined,
      assignToName: assignToName || undefined,
      assignedBy: req.user.id,
      assignedDate: assignedDate || now,
      expectedReturnDate: expectedReturnDate || undefined,
      condition: condition || 'Good',
      notes: notes || undefined,
      hardwareSpecifications: hardwareSpecifications || undefined,
      status: 'Active'
    };

    const assignment = await Assignment.create(assignmentData);

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('asset', 'assetTag name category status')
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email');

    res.status(201).json({ success: true, data: populatedAssignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assignments/bulk
// @desc    Create assignments for multiple assets in one operation
// @access  Private (Admin, IT Staff)
router.post('/bulk', protect, authorize('Admin', 'IT Staff'), [
  body('assets').isArray({ min: 1 }).withMessage('At least one asset ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { assets, assignedTo, assignToName, assignedDate, expectedReturnDate, condition, notes } = req.body;

  if (!assignedTo && !assignToName) {
    return res.status(400).json({ message: 'Either assignedTo (user ID) or assignToName (free-text) is required' });
  }

  try {
    const now = new Date();
    const effectiveAssignedDate = assignedDate ? new Date(assignedDate) : now;

    const createdAssignments = [];

    for (const assetId of assets) {
      const asset = await Asset.findById(assetId);
      if (!asset || !asset.isValid) {
        continue;
      }

      // Update asset status and (optionally) assignedTo
      const update = {
        status: 'In Use',
        assignedDate: effectiveAssignedDate
      };

      if (assignedTo) {
        update.assignedTo = assignedTo;
      }

      await Asset.findByIdAndUpdate(assetId, update);

      const assignment = await Assignment.create({
        asset: assetId,
        assignedTo: assignedTo || undefined,
        assignToName: assignToName || undefined,
        assignedBy: req.user.id,
        assignedDate: effectiveAssignedDate,
        expectedReturnDate: expectedReturnDate || undefined,
        condition: condition || 'Good',
        notes: notes || undefined,
        status: 'Active'
      });

      createdAssignments.push(assignment);
    }

    const populated = await Assignment.find({ _id: { $in: createdAssignments.map(a => a._id) } })
      .populate('asset', 'assetTag name brand model serialNumber status')
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email');

    res.status(201).json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/assignments/:id/return
// @desc    Return assignment
// @access  Private (Admin, IT Staff)
router.put('/:id/return', protect, authorize('Admin', 'IT Staff'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Update asset
    await Asset.findByIdAndUpdate(assignment.asset, {
      assignedTo: null,
      assignedDate: null,
      status: 'In Stock'
    });

    // Update assignment
    assignment.returnDate = new Date();
    assignment.status = 'Returned';
    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('asset', 'assetTag name category status')
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email');

    res.json({ success: true, data: populatedAssignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
