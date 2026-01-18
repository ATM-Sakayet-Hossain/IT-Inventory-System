import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Reports API Error:', error.response?.status, error.response?.data);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view reports');
      } else {
        toast.error('Failed to load reports: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Asset Summary
            </Typography>
            <Typography>Total Assets: {data.assets.total}</Typography>
            <Typography>In Use: {data.assets.inUse}</Typography>
            <Typography>In Stock: {data.assets.inStock}</Typography>
            <Typography>Under Repair: {data.assets.underRepair}</Typography>
            <Typography>Retired: {data.assets.retired}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <Typography>Active Users: {data.users.total}</Typography>
            <Typography>Active Assignments: {data.assignments.active}</Typography>
            <Typography>Pending Maintenance: {data.maintenance.pending}</Typography>
            <Typography>Active Licenses: {data.licenses.active}</Typography>
            <Typography>Expiring Licenses: {data.licenses.expiring}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
