import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function LicenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isITStaff } = useContext(AuthContext);
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    licenseKey: '',
    softwareName: '',
    vendor: '',
    licenseType: 'Subscription',
    purchaseDate: '',
    expiryDate: '',
    cost: '',
    seats: 1,
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    if (!isITStaff) {
      toast.error('Access denied');
      navigate('/licenses');
      return;
    }
    fetchVendors();
    if (isEdit) {
      fetchLicense();
    }
  }, [id, isITStaff, isEdit, navigate]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendors');
      setVendors(response.data.data);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    }
  };

  const fetchLicense = async () => {
    try {
      const response = await axios.get('/api/licenses');
      const license = response.data.data.find(l => l._id === id);
      if (license) {
        setFormData({
          licenseKey: license.licenseKey || '',
          softwareName: license.softwareName || '',
          vendor: license.vendor?._id || '',
          licenseType: license.licenseType || 'Subscription',
          purchaseDate: license.purchaseDate ? license.purchaseDate.split('T')[0] : '',
          expiryDate: license.expiryDate ? license.expiryDate.split('T')[0] : '',
          cost: license.cost || '',
          seats: license.seats || 1,
          status: license.status || 'Active',
          notes: license.notes || '',
        });
      } else {
        toast.error('License not found');
        navigate('/licenses');
      }
    } catch (error) {
      toast.error('Failed to load license');
      navigate('/licenses');
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
        seats: parseInt(formData.seats) || 1,
      };

      if (isEdit) {
        await axios.put(`/api/licenses/${id}`, data);
        toast.success('License updated successfully');
      } else {
        await axios.post('/api/licenses', data);
        toast.success('License created successfully');
      }
      navigate('/licenses');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to save license';
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
        {isEdit ? 'Edit License' : 'Add New License'}
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Key"
                name="licenseKey"
                value={formData.licenseKey}
                onChange={handleChange}
                required
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Software Name"
                name="softwareName"
                value={formData.softwareName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vendor</InputLabel>
                <Select
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  label="Vendor"
                >
                  <MenuItem value="">None</MenuItem>
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>License Type</InputLabel>
                <Select
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  label="License Type"
                >
                  <MenuItem value="Perpetual">Perpetual</MenuItem>
                  <MenuItem value="Subscription">Subscription</MenuItem>
                  <MenuItem value="Open Source">Open Source</MenuItem>
                  <MenuItem value="Trial">Trial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Purchase Date"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seats"
                name="seats"
                type="number"
                value={formData.seats}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                  <MenuItem value="Unused">Unused</MenuItem>
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
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : isEdit ? 'Update' : 'Create'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/licenses')}
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
