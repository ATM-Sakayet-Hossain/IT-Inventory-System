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

export default function MaintenanceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isITStaff, user } = useContext(AuthContext);
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [maintenance, setMaintenance] = useState(null);
  const [formData, setFormData] = useState({
    asset: '',
    maintenanceType: 'Repair',
    description: '',
    performedBy: '',
    vendor: '',
    cost: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: user?.role === 'Employee' ? 'Pending' : 'Scheduled',
    notes: '',
    nextMaintenanceDate: '',
  });

  useEffect(() => {
    fetchAssets();
    fetchVendors();
    if (isEdit) {
      fetchMaintenance();
    }
  }, [id, isEdit, navigate]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('/api/assets', { params: { limit: 1000 } });
      setAssets(response.data.data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendors');
      setVendors(response.data.data);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get('/api/maintenance');
      const record = response.data.data.find(m => m._id === id);
      if (record) {
        setMaintenance(record);
        const isEmployeeEdit = user?.role === 'Employee' && record.status === 'Pending';
        setFormData({
          asset: record.asset?._id || '',
          maintenanceType: record.maintenanceType || 'Repair',
          description: record.description || '',
          performedBy: record.performedBy || '',
          vendor: record.vendor?._id || '',
          cost: record.cost || '',
          startDate: record.startDate ? record.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: record.endDate ? record.endDate.split('T')[0] : '',
          status: isEmployeeEdit ? 'Pending' : (record.status || 'Scheduled'),
          notes: record.notes || '',
          nextMaintenanceDate: record.nextMaintenanceDate ? record.nextMaintenanceDate.split('T')[0] : '',
        });
      } else {
        toast.error('Maintenance record not found');
        navigate('/maintenance');
      }
    } catch (error) {
      toast.error('Failed to load maintenance record');
      navigate('/maintenance');
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

      if (isEdit) {
        await axios.put(`/api/maintenance/${id}`, data);
        toast.success('Maintenance record updated successfully');
      } else {
        await axios.post('/api/maintenance', data);
        toast.success('Maintenance record created successfully');
      }
      navigate('/maintenance');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to save maintenance record';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
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
                <InputLabel>Maintenance Type</InputLabel>
                <Select
                  name="maintenanceType"
                  value={formData.maintenanceType}
                  onChange={handleChange}
                  label="Maintenance Type"
                  disabled={user?.role === 'Employee' && isEdit && maintenance?.status !== 'Pending'}
                >
                  <MenuItem value="Repair">Repair</MenuItem>
                  <MenuItem value="Preventive">Preventive</MenuItem>
                  <MenuItem value="Upgrade">Upgrade</MenuItem>
                  <MenuItem value="Inspection">Inspection</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={3}
              />
            </Grid>
            {isITStaff && (
              <>
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
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            {isITStaff && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {user?.role === 'Employee' && !isEdit && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Your maintenance request will be submitted for admin approval.
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Next Maintenance Date"
                name="nextMaintenanceDate"
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
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
