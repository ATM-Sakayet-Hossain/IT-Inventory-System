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
  TextField,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const statusColors = {
  Active: 'success',
  Expired: 'error',
  Suspended: 'warning',
  Unused: 'default',
};

export default function Licenses() {
  const navigate = useNavigate();
  const { isITStaff } = useContext(AuthContext);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const response = await axios.get('/api/licenses');
      setLicenses(response.data.data);
    } catch (error) {
      toast.error('Failed to load licenses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Software Licenses</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isITStaff && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/licenses/new')}
            >
              Add License
            </Button>
          )}
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Software Name</TableCell>
              <TableCell>License Type</TableCell>
              <TableCell>Seats</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              {isITStaff && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isITStaff ? 6 : 5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : licenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isITStaff ? 6 : 5} align="center">
                  No licenses found
                </TableCell>
              </TableRow>
            ) : (
              licenses
                .filter((license) => {
                  const q = search.toLowerCase();
                  if (!q) return true;
                  const name = license.softwareName?.toLowerCase() || '';
                  const type = license.licenseType?.toLowerCase() || '';
                  const status = license.status?.toLowerCase() || '';
                  const vendor = license.vendor?.name?.toLowerCase() || '';
                  const key = license.licenseKey?.toLowerCase() || '';
                  return (
                    name.includes(q) ||
                    type.includes(q) ||
                    status.includes(q) ||
                    vendor.includes(q) ||
                    key.includes(q)
                  );
                })
                .map((license) => (
                <TableRow key={license._id}>
                  <TableCell>{license.softwareName}</TableCell>
                  <TableCell>{license.licenseType}</TableCell>
                  <TableCell>
                    {license.usedSeats} / {license.seats}
                  </TableCell>
                  <TableCell>
                    {license.expiryDate
                      ? format(new Date(license.expiryDate), 'MMM dd, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={license.status}
                      color={statusColors[license.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  {isITStaff && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/licenses/${license._id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
