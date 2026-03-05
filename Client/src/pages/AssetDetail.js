import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';

const statusColors = {
  'In Use': 'success',
  'In Stock': 'info',
  'Under Repair': 'warning',
  'Retired': 'default',
};

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isITStaff } = useContext(AuthContext);
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAsset = useCallback(async () => {
    try {
      const response = await axios.get(`/api/assets/${id}`);
      setAsset(response.data.data);
    } catch (error) {
      toast.error('Failed to load asset');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!asset) {
    return <Typography>Asset not found</Typography>;
  }

  const hardware = asset.hardwareSpecifications || asset.hardware;

  const purchaseDate = asset.warranty?.purchaseDate
    ? new Date(asset.warranty.purchaseDate)
    : asset.purchaseDate
    ? new Date(asset.purchaseDate)
    : null;

  const warrantyExpiry = asset.warranty?.expiryDate
    ? new Date(asset.warranty.expiryDate)
    : asset.warrantyExpiry
    ? new Date(asset.warrantyExpiry)
    : null;

  const warrantyPeriod = asset.warranty?.period || asset.warranty;
  const warrantyStatus = asset.warranty?.status || asset.warrantyStatus;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/assets')}>
            Back
          </Button>
          <Typography variant="h4">{asset.name}</Typography>
        </Box>
        {isITStaff && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/assets/${id}/edit`)}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Asset Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Asset Tag
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {asset.assetTag}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={asset.status}
                  color={statusColors[asset.status] || 'default'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {asset.category?.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Brand
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {asset.brand || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Model
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {asset.model || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Serial Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {asset.serialNumber || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {asset.location || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Assigned To
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {asset.assignedTo ? `${asset.assignedTo.name} (${asset.assignedTo.email})` : 'Unassigned'}
                </Typography>
              </Grid>
              {purchaseDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {format(purchaseDate, 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
              )}
              {warrantyExpiry && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Warranty Expiry
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {format(warrantyExpiry, 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
              )}
              {warrantyPeriod && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Warranty
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {warrantyPeriod}
                  </Typography>
                </Grid>
              )}
              {warrantyStatus && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Warranty Status
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {warrantyStatus}
                  </Typography>
                </Grid>
              )}
              {asset.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {asset.description}
                  </Typography>
                </Grid>
              )}
              {asset.remarks && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Remarks
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {asset.remarks}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          {hardware && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Hardware Specifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {hardware.ram && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      RAM
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.ram}
                    </Typography>
                  </Grid>
                )}
                {hardware.cpu && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      CPU
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.cpu}
                    </Typography>
                  </Grid>
                )}
                {hardware.cpuGeneration && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      CPU Generation
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.cpuGeneration}
                    </Typography>
                  </Grid>
                )}
                {hardware.ssdSize && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      SSD Size
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.ssdSize}
                    </Typography>
                  </Grid>
                )}
                {hardware.hddSize && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      HDD Size
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.hddSize}
                    </Typography>
                  </Grid>
                )}
                {hardware.motherboard && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Motherboard
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.motherboard}
                    </Typography>
                  </Grid>
                )}
                {hardware.motherboardModel && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Motherboard Model
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.motherboardModel}
                    </Typography>
                  </Grid>
                )}
                {hardware.gpu && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      GPU
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.gpu}
                    </Typography>
                  </Grid>
                )}
                {hardware.macAddress && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      MAC Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.macAddress}
                    </Typography>
                  </Grid>
                )}
                {hardware.ipAddress && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.ipAddress}
                    </Typography>
                  </Grid>
                )}
                {hardware.monitorSize && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Monitor Size
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {hardware.monitorSize}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                QR Code
              </Typography>
              <Box display="flex" justifyContent="center" p={2} bgcolor="white" borderRadius={1}>
                <QRCode value={asset.assetTag} size={200} />
              </Box>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                Scan to view asset details
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
