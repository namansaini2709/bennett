import React, { useState, useEffect } from 'react';
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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility, Assignment, Edit } from '@mui/icons-material';
import axios from 'axios';
import { getStatusColor, getStatusLabel } from '../constants/reportStatus';

const API_BASE_URL = 'http://localhost:5000/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReports();
  }, [page, rowsPerPage]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`, {
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      });
      setReports(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/reports/${selectedReport._id}/status`, {
        status: statusUpdate,
        comment
      });
      setOpenDialog(false);
      fetchReports();
      setStatusUpdate('');
      setComment('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Status functions are now imported from centralized config

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openStatusDialog = (report) => {
    setSelectedReport(report);
    setStatusUpdate(report.status);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports Management
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Reporter</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow hover key={report._id}>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.reporterId?.name || 'Anonymous'}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.priority}
                      size="small"
                      color={report.priority === 'high' || report.priority === 'urgent' ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(report.status)}
                      color={getStatusColor(report.status)}
                      size="small"
                      sx={{
                        minWidth: '100px',
                        height: '24px',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& .MuiChip-label': {
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          lineHeight: '1.2'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{report.assignedTo?.name || '-'}</TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Assign">
                      <IconButton size="small">
                        <Assignment />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Status">
                      <IconButton 
                        size="small" 
                        onClick={() => openStatusDialog(report)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Report Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                label="Status"
              >
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;