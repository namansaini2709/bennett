import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const Analytics = () => {
  const [reportAnalytics, setReportAnalytics] = useState({ timeline: [], categories: [] });
  const [userAnalytics, setUserAnalytics] = useState({ userStats: [], registrationTrend: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [reportsResponse, usersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/reports/analytics`),
        axios.get(`${API_BASE_URL}/admin/users/analytics`)
      ]);

      setReportAnalytics(reportsResponse.data.data);
      setUserAnalytics(usersResponse.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return <Typography>Loading analytics...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics & Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Reports Timeline */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Reports Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportAnalytics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Reports by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportAnalytics.categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {reportAnalytics.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Registration Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Registration Trend (Last 30 days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userAnalytics.registrationTrend.reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Role Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Role Distribution
            </Typography>
            <Box>
              {userAnalytics.userStats.map((stat, index) => (
                <Card key={stat._id} sx={{ mb: 1 }}>
                  <CardContent sx={{ py: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {stat._id.toUpperCase()}
                      </Typography>
                      <Typography variant="h6">
                        {stat.count}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Active: {stat.active} | Verified: {stat.verified}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Top Reporters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Reporters
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userAnalytics.topReporters}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reportCount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;