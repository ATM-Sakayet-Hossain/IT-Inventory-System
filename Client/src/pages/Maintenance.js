import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const statusColors = {
  Pending: 'warning',
  Scheduled: 'info',
  'In Progress': 'warning',
  Completed: 'success',
  Cancelled: 'default',
};

export default function Maintenance() {
  const navigate = useNavigate();
  const { isITStaff, isAdmin, user } = useContext(AuthContext);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get('/api/maintenance');
      setMaintenance(response.data.data);
    } catch (error) {
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Maintenance Records</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/maintenance/new')}
        >
          Request Maintenance
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Requested By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : maintenance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No maintenance records found
                </TableCell>
              </TableRow>
            ) : (
              maintenance.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    {record.asset?.assetTag} - {record.asset?.name}
                  </TableCell>
                  <TableCell>{record.maintenanceType}</TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell>{record.requestedBy?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={statusColors[record.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.startDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {(isITStaff || (record.requestedBy?._id === user?.id && record.status === 'Pending')) && (
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/maintenance/${record._id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {isAdmin && record.status === 'Pending' && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/maintenance/${record._id}/assign`)}
                        title="Assign/Approve"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
