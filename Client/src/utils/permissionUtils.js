/**
 * Permission Utility Functions for Frontend
 * File: Client/src/utils/permissionUtils.js
 */

import axios from '../config/axios';

/**
 * Check if user has module permission
 * @param {Object} user - User object with permissions
 * @param {string} moduleName - Name of module to check
 * @returns {boolean}
 */
export const hasModulePermission = (user, moduleName) => {
  if (!user || !user.permissions) return false;
  return user.permissions.modules?.[moduleName] === true;
};

/**
 * Check if user has action permission
 * @param {Object} user - User object with permissions
 * @param {string} actionName - Name of action to check
 * @returns {boolean}
 */
export const hasActionPermission = (user, actionName) => {
  if (!user || !user.permissions) return false;
  return user.permissions.actions?.[actionName] === true;
};

/**
 * Check if user has resource permission
 * @param {Object} user - User object with permissions
 * @param {string} resourceName - Name of resource to check
 * @returns {boolean}
 */
export const hasResourcePermission = (user, resourceName) => {
  if (!user || !user.permissions) return false;
  return user.permissions.resources?.[resourceName] === true;
};

/**
 * Check multiple permissions (AND logic)
 * @param {Object} user - User object with permissions
 * @param {string[]} permissionList - Array of permission names
 * @param {string} type - Type: 'modules', 'actions', or 'resources'
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissionList, type = 'actions') => {
  if (!user || !user.permissions) return false;
  
  const permissionGroup = user.permissions[type];
  if (!permissionGroup) return false;
  
  return permissionList.every(perm => permissionGroup[perm] === true);
};

/**
 * Check any permission (OR logic)
 * @param {Object} user - User object with permissions
 * @param {string[]} permissionList - Array of permission names
 * @param {string} type - Type: 'modules', 'actions', or 'resources'
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissionList, type = 'actions') => {
  if (!user || !user.permissions) return false;
  
  const permissionGroup = user.permissions[type];
  if (!permissionGroup) return false;
  
  return permissionList.some(perm => permissionGroup[perm] === true);
};

/**
 * Get all accessible modules for user
 * @param {Object} user - User object with permissions
 * @returns {string[]} Array of accessible module names
 */
export const getAccessibleModules = (user) => {
  if (!user || !user.permissions?.modules) return [];
  
  return Object.keys(user.permissions.modules).filter(
    module => user.permissions.modules[module] === true
  );
};

/**
 * Get all allowed actions for user
 * @param {Object} user - User object with permissions
 * @returns {string[]} Array of allowed action names
 */
export const getAllowedActions = (user) => {
  if (!user || !user.permissions?.actions) return [];
  
  return Object.keys(user.permissions.actions).filter(
    action => user.permissions.actions[action] === true
  );
};

/**
 * Get all allowed resources for user
 * @param {Object} user - User object with permissions
 * @returns {string[]} Array of allowed resource names
 */
export const getAllowedResources = (user) => {
  if (!user || !user.permissions?.resources) return [];
  
  return Object.keys(user.permissions.resources).filter(
    resource => user.permissions.resources[resource] === true
  );
};

/**
 * Check permission via API
 * @param {string} module - Module name to check
 * @param {string} action - Action name to check
 * @param {string} resource - Resource name to check
 * @returns {Promise<boolean>}
 */
export const checkPermissionViaAPI = async (module, action, resource) => {
  try {
    const response = await axios.get('/api/permissions/check', {
      params: {
        module: module || null,
        action: action || null,
        resource: resource || null
      }
    });
    
    return response.data.hasPermission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Filter menu items based on user permissions
 * @param {Object[]} menuItems - Array of menu item objects
 * @param {Object} user - User object with permissions
 * @returns {Object[]} Filtered menu items
 * 
 * Menu item structure:
 * {
 *   text: 'Assets',
 *   path: '/assets',
 *   requiredPermission: { type: 'modules', name: 'assets' }
 * }
 */
export const filterMenuByPermissions = (menuItems, user) => {
  if (!user || !user.permissions) return [];
  
  return menuItems.filter(item => {
    if (!item.requiredPermission) return true; // No permission required
    
    const { type, name } = item.requiredPermission;
    
    if (type === 'modules') {
      return hasModulePermission(user, name);
    } else if (type === 'actions') {
      return hasActionPermission(user, name);
    } else if (type === 'resources') {
      return hasResourcePermission(user, name);
    }
    
    return true;
  });
};

/**
 * Get permission summary for user
 * @param {Object} user - User object with permissions
 * @returns {Object} Summary of user permissions
 */
export const getPermissionSummary = (user) => {
  if (!user || !user.permissions) {
    return {
      modules: [],
      actions: [],
      resources: []
    };
  }
  
  return {
    modules: getAccessibleModules(user),
    actions: getAllowedActions(user),
    resources: getAllowedResources(user),
    totalPermissions: 
      Object.values(user.permissions.modules).filter(Boolean).length +
      Object.values(user.permissions.actions).filter(Boolean).length +
      Object.values(user.permissions.resources).filter(Boolean).length
  };
};

/**
 * Initialize permissions from role (frontend default assignment)
 * This is used when role-based defaults are applied before custom permissions
 * @param {string} role - User role
 * @returns {Object} Default permission object
 */
export const getDefaultPermissionsForRole = (role) => {
  const defaults = {
    Admin: {
      modules: { dashboard: true, assets: true, users: true, categories: true, vendors: true, assignments: true, maintenance: true, licenses: true, reports: true },
      actions: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true },
      resources: { canManageUsers: true, canManageVendors: true, canManageAssets: true, canViewReports: true, canApproveRequests: true }
    },
    'IT Staff': {
      modules: { dashboard: true, assets: true, users: false, categories: true, vendors: false, assignments: true, maintenance: true, licenses: true, reports: true },
      actions: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false },
      resources: { canManageUsers: false, canManageVendors: false, canManageAssets: true, canViewReports: true, canApproveRequests: false }
    },
    Employee: {
      modules: { dashboard: false, assets: false, users: false, categories: false, vendors: false, assignments: false, maintenance: true, licenses: false, reports: false },
      actions: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false },
      resources: { canManageUsers: false, canManageVendors: false, canManageAssets: false, canViewReports: false, canApproveRequests: false }
    }
  };
  
  return defaults[role] || defaults.Employee;
};
