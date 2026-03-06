import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isITStaff } = useContext(AuthContext);
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const fetchCategory = useCallback(async () => {
    try {
      const response = await axios.get('/api/categories');
      const category = response.data.data.find(cat => cat._id === id);
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
        });
      } else {
        toast.error('Category not found');
        navigate('/categories');
      }
    } catch (error) {
      toast.error('Failed to load category');
      navigate('/categories');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!isITStaff) {
      toast.error('Access denied');
      navigate('/categories');
      return;
    }

    if (isEdit) {
      fetchCategory();
    }
  }, [isITStaff, isEdit, navigate, fetchCategory]);

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
      if (isEdit) {
        await axios.put(`/api/categories/${id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/categories', formData);
        toast.success('Category created successfully');
      }
      navigate('/categories');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to save category';
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
        {isEdit ? 'Edit Category' : 'Add New Category'}
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
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
              onClick={() => navigate('/categories')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
