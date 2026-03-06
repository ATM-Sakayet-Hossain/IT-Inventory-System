import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function MaintenanceAssign() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [maintenance, setMaintenance] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    assignedTo: '',
    status: 'Scheduled',
    performedBy: '',
    vendor: '',
    cost: '',
    startDate: '',
  });

  const fetchMaintenance = useCallback(async () => {
    try {
      const response = await axios.get('/api/maintenance');
      const record = response.data.data.find(m => m._id === id);
      if (record) {
        setMaintenance(record);
        setFormData({
          assignedTo: record.assignedTo?._id || '',
          status: record.status === 'Pending' ? 'Scheduled' : record.status,
          performedBy: record.performedBy || '',
          vendor: record.vendor?._id || '',
          cost: record.cost || '',
          startDate: record.startDate ? record.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        });
      } else {
        toast.error('Maintenance record not found');
        navigate('/maintenance');
      }
    } catch (error) {
      toast.error('Failed to load maintenance record');
      navigate('/maintenance');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/maintenance');
      return;
    }
    fetchMaintenance();
    fetchUsers();
  }, [isAdmin, navigate, fetchMaintenance]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.data.filter(u => u.isActive && (u.role === 'IT Staff' || u.role === 'Admin')));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
      };

      await axios.put(`/api/maintenance/${id}/assign`, data);
      toast.success('Maintenance request assigned successfully');
      navigate('/maintenance');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to assign maintenance';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!maintenance) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Assign Maintenance Request
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">Request Details</Typography>
          <Typography variant="body1"><strong>Asset:</strong> {maintenance.asset?.assetTag} - {maintenance.asset?.name}</Typography>
          <Typography variant="body1"><strong>Type:</strong> {maintenance.maintenanceType}</Typography>
          <Typography variant="body1"><strong>Description:</strong> {maintenance.description}</Typography>
          <Typography variant="body1"><strong>Requested By:</strong> {maintenance.requestedBy?.name}</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  label="Assign To"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Performed By"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Assign & Approve'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/maintenance')}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
