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
  Switch,
  FormControlLabel,
} from '@mui/material';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useContext(AuthContext);
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: '',
    phone: '',
    isActive: true,
  });

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      const user = response.data.data;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'Employee',
        department: user.department || '',
        phone: user.phone || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } catch (error) {
      toast.error('Failed to load user');
      navigate('/users');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/users');
      return;
    }

    if (isEdit) {
      fetchUser();
    }
  }, [isAdmin, isEdit, navigate, fetchUser]);

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
      const data = { ...formData };
      
      // Don't send password if editing and password is empty
      if (isEdit && !data.password) {
        delete data.password;
      }

      if (isEdit) {
        await axios.put(`/api/users/${id}`, data);
        toast.success('User updated successfully');
      } else {
        // Use register endpoint for creating new users
        await axios.post('/api/auth/register', data);
        toast.success('User created successfully');
      }
      navigate('/users');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to save user';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit User' : 'Add New User'}
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                helperText={isEdit ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="IT Staff">IT Staff</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleChange}
                      name="isActive"
                    />
                  }
                  label="Active User"
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
                  {loading ? <CircularProgress size={24} /> : isEdit ? 'Update User' : 'Create User'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users')}
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
