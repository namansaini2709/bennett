import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Report,
  People,
  CheckCircle,
  Pending,
  TrendingUp
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { getStatusColor, getStatusLabel } from '../constants/reportStatus';
import AnimatedCard from '../components/AnimatedCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Dashboard Overview
          </Typography>
        </motion.div>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
              <StatCard stat={stat} index={index} />
            </Grid>
          ))}
        </Grid>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
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
      </motion.div>
    </Box>
    </motion.div>
  );
};

const StatCard = ({ stat, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <AnimatedCard
      ref={ref}
      delay={index * 0.1}
      sx={{
        background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
        border: `1px solid ${stat.color}30`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
              {stat.title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
              {inView ? <CountUp end={stat.value} duration={2} /> : '0'}
            </Typography>
          </Box>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <Box
              sx={{
                color: stat.color,
                background: `${stat.color}20`,
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {stat.icon}
            </Box>
          </motion.div>
        </Box>
      </CardContent>
    </AnimatedCard>
  );
};

export default Dashboard;
