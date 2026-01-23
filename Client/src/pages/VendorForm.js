import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function VendorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isITStaff } = useContext(AuthContext);
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    isActive: true,
  });

  const fetchVendor = useCallback(async () => {
    try {
      const response = await axios.get('/api/vendors');
      const vendor = response.data.data.find(v => v._id === id);
      if (vendor) {
        setFormData({
          name: vendor.name || '',
          contactPerson: vendor.contactPerson || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          address: vendor.address || '',
          website: vendor.website || '',
          isActive: vendor.isActive !== undefined ? vendor.isActive : true,
        });
      } else {
        toast.error('Vendor not found');
        navigate('/vendors');
      }
    } catch (error) {
      toast.error('Failed to load vendor');
      navigate('/vendors');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!isITStaff) {
      toast.error('Access denied');
      navigate('/vendors');
      return;
    }

    if (isEdit) {
      fetchVendor();
    }
  }, [isITStaff, isEdit, navigate, fetchVendor]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`/api/vendors/${id}`, formData);
        toast.success('Vendor updated successfully');
      } else {
        await axios.post('/api/vendors', formData);
        toast.success('Vendor created successfully');
      }
      navigate('/vendors');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to save vendor';
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
        {isEdit ? 'Edit Vendor' : 'Add New Vendor'}
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleChange}
                      name="isActive"
                    />
                  }
                  label="Active Vendor"
                />
              </Grid>
            )}
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
                  onClick={() => navigate('/vendors')}
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
