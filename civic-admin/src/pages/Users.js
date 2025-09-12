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
  Typography,
  Avatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      });
      setUsers(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const endpoint = currentStatus ? 'deactivate' : 'activate';
      await axios.put(`${API_BASE_URL}/users/${userId}/${endpoint}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      citizen: 'default',
      staff: 'primary',
      supervisor: 'secondary',
      admin: 'error'
    };
    return colors[role] || 'default';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow hover key={user._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      {user.name}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isVerified ? 'Verified' : 'Unverified'}
                      color={user.isVerified ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.isActive}
                          onChange={() => handleStatusToggle(user._id, user.isActive)}
                          size="small"
                        />
                      }
                      label={user.isActive ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
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
    </Box>
  );
};

export default Users;