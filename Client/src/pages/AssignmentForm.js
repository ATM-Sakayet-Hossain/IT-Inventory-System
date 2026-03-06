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
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AssignmentForm() {
  const navigate = useNavigate();
  const { isITStaff } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetSearch] = useState('');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [formData, setFormData] = useState({
    assignToName: '',
    assignedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    condition: 'Good',
    notes: '',
    // Optional hardware snapshot
    ram: '',
    cpu: '',
    cpuGeneration: '',
    ssdSize: '',
    hddSize: '',
    motherboard: '',
    motherboardModel: '',
    gpu: '',
    macAddress: '',
    ipAddress: '',
    monitorSize: '',
  });

  useEffect(() => {
    if (!isITStaff) {
      toast.error('Access denied');
      navigate('/assignments');
      return;
    }
    fetchAssets();
  }, [isITStaff, navigate]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('/api/assets', {
        params: { status: 'In Stock', limit: 50 }
      });
      setAssets(response.data.data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const handleAddAsset = (assetId) => {
    const asset = assets.find((a) => a._id === assetId);
    if (!asset) return;
    if (selectedAssets.some((a) => a._id === assetId)) return;
    setSelectedAssets((prev) => [...prev, asset]);
  };

  const handleRemoveAsset = (assetId) => {
    setSelectedAssets((prev) => prev.filter((a) => a._id !== assetId));
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
      if (selectedAssets.length === 0) {
        toast.error('Please add at least one asset to the assignment');
        setLoading(false);
        return;
      }
      if (!formData.assignToName.trim()) {
        toast.error('Assign To is required');
        setLoading(false);
        return;
      }

      const {
        assignToName,
        assignedDate,
        expectedReturnDate,
        condition,
        notes,
        ram,
        cpu,
        cpuGeneration,
        ssdSize,
        hddSize,
        motherboard,
        motherboardModel,
        gpu,
        macAddress,
        ipAddress,
        monitorSize,
      } = formData;

      const hardwareSpecifications = {
        ram,
        cpu,
        cpuGeneration,
        ssdSize,
        hddSize,
        motherboard,
        motherboardModel,
        gpu,
        macAddress,
        ipAddress,
        monitorSize,
      };

      Object.keys(hardwareSpecifications).forEach((key) => {
        if (!hardwareSpecifications[key]) {
          delete hardwareSpecifications[key];
        }
      });

      const payload = {
        assets: selectedAssets.map((a) => a._id),
        assignToName,
        assignedDate: assignedDate || undefined,
        expectedReturnDate: expectedReturnDate || undefined,
        condition,
        notes: notes || undefined,
      };

      if (Object.keys(hardwareSpecifications).length > 0) {
        payload.hardwareSpecifications = hardwareSpecifications;
      }

      await axios.post('/api/assignments/bulk', payload);
      toast.success('Assignments created successfully');
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
                  value=""
                  onChange={(e) => {
                    handleAddAsset(e.target.value);
                  }}
                  label="Asset"
                >
                  {assets
                    .filter((asset) => {
                      const q = assetSearch.toLowerCase();
                      if (!q) return true;
                      return (
                        asset.assetTag?.toLowerCase().includes(q) ||
                        asset.name?.toLowerCase().includes(q) ||
                        asset.serialNumber?.toLowerCase().includes(q)
                      );
                    })
                    .map((asset) => (
                      <MenuItem key={asset._id} value={asset._id}>
                        {asset.assetTag} - {asset.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assign To (User Name)"
                name="assignToName"
                value={formData.assignToName}
                onChange={handleChange}
                required
              />
            </Grid>
            {selectedAssets.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Selected Assets
                </Typography>
                <Paper variant="outlined">
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Asset Tag</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Product Name</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Brand</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Model</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Serial Number</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>State</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssets.map((asset) => (
                          <tr key={asset._id}>
                            <td style={{ padding: '8px' }}>{asset.assetTag}</td>
                            <td style={{ padding: '8px' }}>{asset.name}</td>
                            <td style={{ padding: '8px' }}>{asset.brand || 'N/A'}</td>
                            <td style={{ padding: '8px' }}>{asset.model || 'N/A'}</td>
                            <td style={{ padding: '8px' }}>{asset.serialNumber || 'N/A'}</td>
                            <td style={{ padding: '8px' }}>{asset.status}</td>
                            <td style={{ padding: '8px' }}>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleRemoveAsset(asset._id)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Paper>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assign Date"
                name="assignedDate"
                type="date"
                value={formData.assignedDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
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
                label="Note"
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
