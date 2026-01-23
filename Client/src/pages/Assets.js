import React, { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const statusColors = {
  'In Use': 'success',
  'In Stock': 'info',
  'Under Repair': 'warning',
  'Retired': 'default',
};

export default function Assets() {
  const navigate = useNavigate();
  const { isITStaff, isAdmin } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
  });
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };
      const response = await axios.get('/api/assets', { params });
      setAssets(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchCategories();
    fetchAssets();
  }, [fetchAssets]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Assets</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/assets/new')}
          >
            Add Asset
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Search assets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="In Use">In Use</MenuItem>
              <MenuItem value="In Stock">In Stock</MenuItem>
              <MenuItem value="Under Repair">Under Repair</MenuItem>
              <MenuItem value="Retired">Retired</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset Tag</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Location</TableCell>
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
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No assets found
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset._id}>
                  <TableCell>{asset.assetTag}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.category?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={asset.status}
                      color={statusColors[asset.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {asset.assignedTo ? asset.assignedTo.name : 'Unassigned'}
                  </TableCell>
                  <TableCell>{asset.location || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/assets/${asset._id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {isITStaff && (
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/assets/${asset._id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}
