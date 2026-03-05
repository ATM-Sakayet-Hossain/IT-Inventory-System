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
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    status: 'In Stock',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiry: '',
    vendor: '',
    warrantyPeriod: '',
    warrantyStatus: 'Active',
    remarks: '',
  });

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendors');
      setVendors(response.data.data);
    } catch (error) {
      toast.error('Failed to load vendors');
    }
  };

  const fetchAsset = useCallback(async () => {
    try {
      const response = await axios.get(`/api/assets/${id}`);
      const asset = response.data.data;
      setFormData({
        assetTag: asset.assetTag || '',
        name: asset.name || '',
        category: asset.category?._id || '',
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        status: asset.status || 'In Stock',
        location: asset.location || '',
        purchaseDate: asset.warranty?.purchaseDate
          ? asset.warranty.purchaseDate.split('T')[0]
          : asset.purchaseDate
          ? asset.purchaseDate.split('T')[0]
          : '',
        purchasePrice: asset.purchasePrice || '',
        warrantyExpiry: asset.warranty?.expiryDate
          ? asset.warranty.expiryDate.split('T')[0]
          : asset.warrantyExpiry
          ? asset.warrantyExpiry.split('T')[0]
          : '',
        vendor: asset.vendor?._id || '',
        warrantyPeriod: asset.warranty?.period || asset.warranty || '',
        warrantyStatus: asset.warranty?.status || asset.warrantyStatus || 'Active',
        remarks: asset.remarks || '',
      });
    } catch (error) {
      toast.error('Failed to load asset');
      navigate('/assets');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCategories();
    fetchVendors();
    if (isEdit) {
      fetchAsset();
    }
  }, [isEdit, fetchAsset]);

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
      const {
        assetTag,
        name,
        category,
        brand,
        model,
        serialNumber,
        status,
        location,
        purchaseDate,
        purchasePrice,
        warrantyExpiry,
        vendor,
        warrantyPeriod,
        warrantyStatus,
        remarks,
      } = formData;

      // Basic required-field validation on the client side
      if (!assetTag || !name || !serialNumber || !purchaseDate || !purchasePrice || !warrantyPeriod || !warrantyExpiry) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      const data = {
        assetTag,
        name,
        category,
        brand,
        model,
        serialNumber,
        status,
        location,
        purchaseDate: purchaseDate || undefined,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        vendor: vendor || undefined,
        remarks,
      };

      const warranty = {
        period: warrantyPeriod,
        purchaseDate: purchaseDate || undefined,
        expiryDate: warrantyExpiry || undefined,
        status: warrantyStatus || 'Active',
      };

      Object.keys(warranty).forEach((key) => {
        if (!warranty[key]) {
          delete warranty[key];
        }
      });

      if (Object.keys(warranty).length > 0) {
        data.warranty = warranty;
      }

      if (isEdit) {
        await axios.put(`/api/assets/${id}`, data);
        toast.success('Asset updated successfully');
      } else {
        await axios.post('/api/assets', data);
        toast.success('Asset created successfully');
      }
      navigate('/assets');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Asset' : 'Add New Asset'}
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Asset Tag"
                name="assetTag"
                value={formData.assetTag}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Asset State</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Asset State"
                >
                  <MenuItem value="In Use">In Use</MenuItem>
                  <MenuItem value="In Stock">Available</MenuItem>
                  <MenuItem value="Under Repair">Repair</MenuItem>
                  <MenuItem value="Retired">Retired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Serial Number"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Date"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Cost"
                name="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warranty Expiry Date"
                name="warrantyExpiry"
                type="date"
                value={formData.warrantyExpiry}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
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
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Warranty & Remarks
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warranty (e.g. 3 Years)"
                name="warrantyPeriod"
                value={formData.warrantyPeriod}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Warranty Status</InputLabel>
                <Select
                  name="warrantyStatus"
                  value={formData.warrantyStatus}
                  onChange={handleChange}
                  label="Warranty Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks}
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
                  onClick={() => navigate('/assets')}
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
