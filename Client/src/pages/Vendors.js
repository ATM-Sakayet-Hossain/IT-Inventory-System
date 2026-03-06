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
  Button,
  IconButton,
  Chip,
  TextField,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Vendors() {
  const navigate = useNavigate();
  const { isITStaff, isAdmin } = useContext(AuthContext);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendors');
      setVendors(response.data.data);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await axios.delete(`/api/vendors/${id}`);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to delete vendor');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Vendors</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/vendors/new')}
            >
              Add Vendor
            </Button>
          )}
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
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
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isITStaff ? 6 : 5} align="center">
                  No vendors found
                </TableCell>
              </TableRow>
            ) : (
              vendors
                .filter((vendor) => {
                  const q = search.toLowerCase();
                  if (!q) return true;
                  const name = vendor.name?.toLowerCase() || '';
                  const contact = vendor.contactPerson?.toLowerCase() || '';
                  const email = vendor.email?.toLowerCase() || '';
                  const phone = vendor.phone?.toLowerCase() || '';
                  const status = (vendor.isActive ? 'active' : 'inactive');
                  return (
                    name.includes(q) ||
                    contact.includes(q) ||
                    email.includes(q) ||
                    phone.includes(q) ||
                    status.includes(q)
                  );
                })
                .map((vendor) => (
                <TableRow key={vendor._id}>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>{vendor.contactPerson || 'N/A'}</TableCell>
                  <TableCell>{vendor.email || 'N/A'}</TableCell>
                  <TableCell>{vendor.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={vendor.isActive ? 'Active' : 'Inactive'}
                      color={vendor.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  {isITStaff && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/vendors/${vendor._id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      {isAdmin && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(vendor._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
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
