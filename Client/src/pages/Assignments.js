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
import { Add as AddIcon, Undo as UndoIcon } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Assignments() {
  const navigate = useNavigate();
  const { isITStaff } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/assignments');
      setAssignments(response.data.data);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (assignmentId, assetId) => {
    if (!window.confirm('Are you sure you want to return this asset?')) {
      return;
    }

    try {
      await axios.put(`/api/assignments/${assignmentId}/return`);
      toast.success('Asset returned successfully');
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to return asset');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Assignments</Typography>
        {isITStaff && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/assignments/new')}
          >
            Create Assignment
          </Button>
        )}
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Assigned Date</TableCell>
              <TableCell>Status</TableCell>
              {isITStaff && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isITStaff ? 5 : 4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isITStaff ? 5 : 4} align="center">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell>
                    {assignment.asset?.assetTag} - {assignment.asset?.name}
                  </TableCell>
                  <TableCell>{assignment.assignedTo?.name}</TableCell>
                  <TableCell>
                    {format(new Date(assignment.assignedDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.status}
                      color={assignment.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  {isITStaff && assignment.status === 'Active' && (
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleReturn(assignment._id, assignment.asset?._id)}
                      >
                        <UndoIcon />
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
