const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Maintenance = require('../models/Maintenance');
const License = require('../models/License');
const { protect, authorize } = require('../middleware/auth');
const { checkModulePermission, checkResourcePermission } = require('../middleware/permissions');

// Helper function to get dashboard statistics
const getDashboardStats = async () => {
  try {
    const totalAssets = await Asset.countDocuments();
    const assetsInUse = await Asset.countDocuments({ status: 'In Use' });
    const assetsInStock = await Asset.countDocuments({ status: 'In Stock' });
    const assetsUnderRepair = await Asset.countDocuments({ status: 'Under Repair' });
    const assetsRetired = await Asset.countDocuments({ status: 'Retired' });

    const totalUsers = await User.countDocuments({ isActive: true });
    const activeAssignments = await Assignment.countDocuments({ status: 'Active' });

    const pendingMaintenance = await Maintenance.countDocuments({ status: 'Scheduled' });
    const activeLicenses = await License.countDocuments({ status: 'Active' });
    const expiringLicenses = await License.countDocuments({
      status: 'Active',
      expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });

    // Assets by category
    const assetsByCategory = await Asset.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          category: '$category.name',
          count: 1
        }
      }
    ]);

    // Assets by status
    const assetsByStatus = await Asset.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent assignments
    const recentAssignments = await Assignment.find({ status: 'Active' })
      .populate('asset', 'assetTag name')
      .populate('assignedTo', 'name email')
      .sort({ assignedDate: -1 })
      .limit(5);

    // Warranty expiring soon
    const warrantyExpiring = await Asset.find({
      warrantyExpiry: {
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        $gte: new Date()
      }
    })
      .populate('category', 'name')
      .limit(10);

    return {
      assets: {
        total: totalAssets,
        inUse: assetsInUse,
        inStock: assetsInStock,
        underRepair: assetsUnderRepair,
        retired: assetsRetired,
        byCategory: assetsByCategory,
        byStatus: assetsByStatus
      },
      users: {
        total: totalUsers
      },
      assignments: {
        active: activeAssignments
      },
      maintenance: {
        pending: pendingMaintenance
      },
      licenses: {
        active: activeLicenses,
        expiring: expiringLicenses
      },
      recentAssignments,
      warrantyExpiring
    };
  } catch (error) {
    throw error;
  }
};

// @route   GET /api/reports/stats
// @desc    Get dashboard statistics (NO PERMISSION CHECK - for Dashboard)
// @access  Private (auth only, no report permission needed)
router.get('/stats', protect, async (req, res) => {
  try {
    const data = await getDashboardStats();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/dashboard
// @desc    Get dashboard statistics (NO PERMISSION CHECK - all users can access)
// @access  Private (auth only)
router.get('/dashboard', protect, async (req, res) => {
  try {
    const data = await getDashboardStats();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
