import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AssignmentForm() {
  const navigate = useNavigate();
  const { isITStaff } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    asset: '',
    assignedTo: '',
    expectedReturnDate: '',
    condition: 'Good',
    notes: '',
  });

  useEffect(() => {
    if (!isITStaff) {
      toast.error('Access denied');
      navigate('/assignments');
      return;
    }
    fetchAssets();
    fetchUsers();
  }, [isITStaff, navigate]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('/api/assets', { params: { status: 'In Stock', limit: 1000 } });
      setAssets(response.data.data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.data.filter(u => u.isActive));
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
      await axios.post('/api/assignments', formData);
      toast.success('Assignment created successfully');
      navigate('/assignments');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to create assignment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isITStaff) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create Assignment
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Asset</InputLabel>
                <Select
                  name="asset"
                  value={formData.asset}
                  onChange={handleChange}
                  label="Asset"
                >
                  {assets.map((asset) => (
                    <MenuItem key={asset._id} value={asset._id}>
                      {asset.assetTag} - {asset.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  label="Assign To"
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expected Return Date"
                name="expectedReturnDate"
                type="date"
                value={formData.expectedReturnDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  label="Condition"
                >
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Assignment'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/assignments')}
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
