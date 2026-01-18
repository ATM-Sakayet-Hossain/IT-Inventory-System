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
// @desc    Create assignment
// @access  Private (Admin, IT Staff)
router.post('/', protect, authorize('Admin', 'IT Staff'), [
  body('asset').notEmpty().withMessage('Asset ID is required'),
  body('assignedTo').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Update asset status
    await Asset.findByIdAndUpdate(req.body.asset, {
      assignedTo: req.body.assignedTo,
      assignedDate: new Date(),
      status: 'In Use'
    });

    const assignment = await Assignment.create({
      ...req.body,
      assignedBy: req.user.id
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('asset', 'assetTag name category status')
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email');

    res.status(201).json({ success: true, data: populatedAssignment });
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
