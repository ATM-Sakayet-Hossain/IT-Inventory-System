/**
 * PermissionBasedRoute Component
 * Protects routes based on user permissions
 * File: Client/src/components/PermissionBasedRoute.js
 */

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  hasModulePermission,
  hasActionPermission,
  hasResourcePermission,
  hasAllPermissions,
  hasAnyPermission
} from '../utils/permissionUtils';

/**
 * PermissionBasedRoute Component
 * 
 * Protects routes by checking user permissions
 * 
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {Object} requiredPermission - Permission requirement
 * @param {string} requiredPermission.type - Type: 'module', 'action', or 'resource'
 * @param {string|string[]} requiredPermission.name - Permission name(s)
 * @param {string} requiredPermission.logic - 'AND' or 'OR' for multiple permissions
 * 
 * Usage:
 * <PermissionBasedRoute 
 *   requiredPermission={{ type: 'module', name: 'assets' }}
 * >
 *   <Assets />
 * </PermissionBasedRoute>
 * 
 * <PermissionBasedRoute 
 *   requiredPermission={{ 
 *     type: 'actions', 
 *     name: ['canCreate', 'canUpdate'],
 *     logic: 'OR'
 *   }}
 * >
 *   <CreateForm />
 * </PermissionBasedRoute>
 */
const PermissionBasedRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no permission check required, allow access
  if (!requiredPermission) {
    return children;
  }

  // Check permission
  let hasPermission = false;
  const { type, name, logic = 'AND' } = requiredPermission;

  if (type === 'module') {
    hasPermission = hasModulePermission(user, name);
  } else if (type === 'action') {
    if (Array.isArray(name)) {
      hasPermission = logic === 'AND' 
        ? hasAllPermissions(user, name, 'actions')
        : hasAnyPermission(user, name, 'actions');
    } else {
      hasPermission = hasActionPermission(user, name);
    }
  } else if (type === 'resource') {
    if (Array.isArray(name)) {
      hasPermission = logic === 'AND'
        ? hasAllPermissions(user, name, 'resources')
        : hasAnyPermission(user, name, 'resources');
    } else {
      hasPermission = hasResourcePermission(user, name);
    }
  }

  if (!hasPermission) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={2}
      >
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, boxShadow: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            color="error"
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            🔒 Permission Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            You do not have permission to access this page.
          </Typography>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Required Permission:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Array.isArray(name) 
                ? `${type} (${name.join(', ')}) - ${logic} logic`
                : `${type}: ${name}`
              }
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Please contact your administrator if you need access to this feature.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{ mr: 1 }}
            >
              Go Back
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default PermissionBasedRoute;
