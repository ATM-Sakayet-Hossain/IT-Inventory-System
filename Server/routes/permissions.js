const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

/**
 * Permission Management Routes
 * All routes require Admin authentication
 */

// Default permissions for each role
const defaultPermissions = {
  Admin: {
    modules: {
      dashboard: true,
      assets: true,
      users: true,
      categories: true,
      vendors: true,
      assignments: true,
      maintenance: true,
      licenses: true,
      reports: true
    },
    actions: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canApprove: true
    },
    resources: {
      canManageUsers: true,
      canManageVendors: true,
      canManageAssets: true,
      canViewReports: true,
      canApproveRequests: true
    }
  },
  'IT Staff': {
    modules: {
      dashboard: true,
      assets: true,
      users: false,
      categories: true,
      vendors: false,
      assignments: true,
      maintenance: true,
      licenses: true,
      reports: true
    },
    actions: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canApprove: false
    },
    resources: {
      canManageUsers: false,
      canManageVendors: false,
      canManageAssets: true,
      canViewReports: true,
      canApproveRequests: false
    }
  },
  Employee: {
    modules: {
      dashboard: false,
      assets: false,
      users: false,
      categories: false,
      vendors: false,
      assignments: false,
      maintenance: true,
      licenses: false,
      reports: false
    },
    actions: {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canApprove: false
    },
    resources: {
      canManageUsers: false,
      canManageVendors: false,
      canManageAssets: false,
      canViewReports: false,
      canApproveRequests: false
    }
  }
};

/**
 * @route   GET /api/permissions/user/:id
 * @desc    Get user permissions
 * @access  Private (Admin only)
 */
router.get('/user/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user || !user.isValid) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/permissions/defaults/:role
 * @desc    Get default permissions for a role
 * @access  Private (Admin only)
 */
router.get('/defaults/:role', protect, authorize('Admin'), async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['Admin', 'IT Staff', 'Employee'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    res.json({
      success: true,
      role,
      permissions: defaultPermissions[role]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/permissions/user/:id
 * @desc    Update user permissions
 * @access  Private (Admin only)
 */
router.post(
  '/user/:id',
  protect,
  authorize('Admin'),
  [
    body('modules').optional().isObject(),
    body('actions').optional().isObject(),
    body('resources').optional().isObject()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    try {
      const user = await User.findById(req.params.id);

      if (!user || !user.isValid) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update permissions
      if (req.body.modules) {
        user.permissions.modules = {
          ...user.permissions.modules,
          ...req.body.modules
        };
      }

      if (req.body.actions) {
        user.permissions.actions = {
          ...user.permissions.actions,
          ...req.body.actions
        };
      }

      if (req.body.resources) {
        user.permissions.resources = {
          ...user.permissions.resources,
          ...req.body.resources
        };
      }

      await user.save();

      res.json({
        success: true,
        message: 'User permissions updated successfully',
        data: {
          userId: user._id,
          name: user.name,
          email: user.email,
          permissions: user.permissions
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/permissions/user/:id/reset
 * @desc    Reset user permissions to role defaults
 * @access  Private (Admin only)
 */
router.put('/user/:id/reset', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isValid) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Reset to default permissions for their role
    user.permissions = defaultPermissions[user.role];
    await user.save();

    res.json({
      success: true,
      message: 'User permissions reset to role defaults',
      data: {
        userId: user._id,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/permissions/check
 * @desc    Check if current user has specific permission
 * @access  Private
 * 
 * Query params:
 * - module: module name (e.g., 'users', 'assets')
 * - action: action name (e.g., 'canCreate', 'canDelete')
 * - resource: resource name (e.g., 'canManageUsers')
 */
router.get('/check', protect, async (req, res) => {
  try {
    const { module, action, resource } = req.query;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let hasPermission = false;

    // Check module permission
    if (module) {
      hasPermission = user.permissions.modules[module] === true;
    }

    // Check action permission
    if (action && !module) {
      hasPermission = user.permissions.actions[action] === true;
    }

    // Check resource permission
    if (resource && !module && !action) {
      hasPermission = user.permissions.resources[resource] === true;
    }

    res.json({
      success: true,
      hasPermission,
      queryType: module ? 'module' : (action ? 'action' : 'resource'),
      query: { module, action, resource },
      userRole: user.role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/permissions/all
 * @desc    Get all users with their permissions (Admin list view)
 * @access  Private (Admin only)
 */
router.get('/all', protect, authorize('Admin'), async (req, res) => {
  try {
    const users = await User.find({ isValid: true })
      .select('name email role permissions isActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
