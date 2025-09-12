import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Report,
  People,
  CheckCircle,
  Pending,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import axios from 'axios';
import { getStatusColor, getStatusLabel } from '../constants/reportStatus';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    todayReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalUsers: 0,
    activeStaff: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard`);
      const { stats, recentReports } = response.data.data;
      setStats(stats);
      setRecentReports(recentReports);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Status functions are now imported from centralized config

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: <Report fontSize="large" />,
      color: '#2196F3'
    },
    {
      title: 'Today\'s Reports',
      value: stats.todayReports,
      icon: <TrendingUp fontSize="large" />,
      color: '#4CAF50'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: <Pending fontSize="large" />,
      color: '#FF9800'
    },
    {
      title: 'Resolved Reports',
      value: stats.resolvedReports,
      icon: <CheckCircle fontSize="large" />,
      color: '#4CAF50'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People fontSize="large" />,
      color: '#9C27B0'
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff,
      icon: <People fontSize="large" />,
      color: '#00BCD4'
    }
  ];

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Reports
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Reporter</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentReports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.reporterId?.name || 'Anonymous'}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(report.status)}
                      color={getStatusColor(report.status)}
                      size="small"
                      sx={{
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;