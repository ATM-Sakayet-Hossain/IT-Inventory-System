import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';


const RoleBasedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

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

  // If no required roles specified, allow access
  if (requiredRoles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  const hasRequiredRole = requiredRoles.includes(user?.role);

  if (!hasRequiredRole) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h5" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You do not have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your role: <strong>{user?.role}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Required roles: <strong>{requiredRoles.join(', ')}</strong>
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default RoleBasedRoute;
