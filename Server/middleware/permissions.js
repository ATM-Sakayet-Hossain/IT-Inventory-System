/**
 * Permission Checking Middleware
 * Provides functions to check user permissions
 */

const User = require('../models/User');

/**
 * Check if user has module access permission
 * Usage: hasModulePermission('dashboard')
 * 
 * @param {string} moduleName - Name of the module to check
 * @returns {Function} Express middleware
 */
exports.checkModulePermission = (moduleName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const hasPermission = user.permissions?.modules?.[moduleName] === true;

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `User does not have permission to access '${moduleName}' module`,
          requiredModule: moduleName,
          userRole: user.role
        });
      }

      // Attach permissions to request for later use
      req.userPermissions = user.permissions;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
};

/**
 * Check if user has action permission
 * Usage: checkActionPermission('canCreate')
 * 
 * @param {string} actionName - Name of the action to check
 * @returns {Function} Express middleware
 */
exports.checkActionPermission = (actionName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const hasPermission = user.permissions?.actions?.[actionName] === true;

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `User does not have permission to perform '${actionName}' action`,
          requiredAction: actionName,
          userRole: user.role
        });
      }

      req.userPermissions = user.permissions;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

/**
 * Check if user has resource permission
 * Usage: checkResourcePermission('canManageUsers')
 * 
 * @param {string} resourceName - Name of the resource to check
 * @returns {Function} Express middleware
 */
exports.checkResourcePermission = (resourceName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const hasPermission = user.permissions?.resources?.[resourceName] === true;

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `User does not have permission to '${resourceName}'`,
          requiredResource: resourceName,
          userRole: user.role
        });
      }

      req.userPermissions = user.permissions;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

/**
 * Check multiple permissions (AND logic - all must be true)
 * Usage: checkMultiplePermissions(['canCreate', 'canRead'])
 * 
 * @param {string[]} permissionList - Array of permission names
 * @param {string} type - Type of permissions: 'modules', 'actions', or 'resources'
 * @returns {Function} Express middleware
 */
exports.checkMultiplePermissions = (permissionList, type = 'actions') => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const permissionGroup = user.permissions?.[type];

      if (!permissionGroup) {
        return res.status(403).json({
          success: false,
          message: 'User has no permissions'
        });
      }

      // Check if user has ALL required permissions
      const hasAllPermissions = permissionList.every(
        permission => permissionGroup[permission] === true
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'User does not have all required permissions',
          requiredPermissions: permissionList,
          userRole: user.role
        });
      }

      req.userPermissions = user.permissions;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

/**
 * Check any permission (OR logic - at least one must be true)
 * Usage: checkAnyPermission(['canCreate', 'canUpdate'])
 * 
 * @param {string[]} permissionList - Array of permission names
 * @param {string} type - Type of permissions: 'modules', 'actions', or 'resources'
 * @returns {Function} Express middleware
 */
exports.checkAnyPermission = (permissionList, type = 'actions') => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const permissionGroup = user.permissions?.[type];

      if (!permissionGroup) {
        return res.status(403).json({
          success: false,
          message: 'User has no permissions'
        });
      }

      // Check if user has AT LEAST ONE required permission
      const hasAnyPermission = permissionList.some(
        permission => permissionGroup[permission] === true
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: 'User does not have any of the required permissions',
          requiredPermissions: permissionList,
          userRole: user.role
        });
      }

      req.userPermissions = user.permissions;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

module.exports = exports;
