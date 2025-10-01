import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getStatusColor, getStatusLabel } from '../../constants/reportStatus';
import reportService from '../../services/reportService';
import { showErrorAlert } from '../../utils/errorHandler';

const MyReportsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setError(null);
      const result = await reportService.getMyReports();

      if (result.success) {
        const transformedReports = result.data.map(report => ({
          id: report._id,
          title: report.title,
          category: report.category,
          status: report.status,
          createdAt: new Date(report.createdAt).toLocaleDateString(),
          location: report.location?.address || 'Location not specified',
          description: report.description,
          media: report.media || [],
          upvotes: Array.isArray(report.upvotes) ? report.upvotes.length : 0,
          comments: Array.isArray(report.comments) ? report.comments.length : 0
        }));

        setReports(transformedReports);
      } else {
        console.error('Failed to fetch reports:', result.message);
        const errorMsg = result.message?.includes('token') || result.message?.includes('authorized')
          ? 'Your session has expired. Please log in again.'
          : result.message || 'Failed to fetch reports';
        setError(errorMsg);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      const errorMessage = error?.message?.includes('Network Error')
        ? 'No internet connection. Please check your network and try again.'
        : error?.response?.status === 401
        ? 'Your session has expired. Please log in again.'
        : 'Failed to load reports. Please try again.';
      setError(errorMessage);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  // Status functions are now imported from centralized config

  const getCategoryIcon = (category) => {
    const iconMap = {
      road_issue: 'road',
      water_supply: 'water',
      electricity: 'lightning-bolt',
      garbage: 'delete',
      drainage: 'pipe',
      street_light: 'lightbulb',
      traffic: 'traffic-light',
      pollution: 'smoke',
      encroachment: 'alert',
      other: 'help-circle'
    };
    return iconMap[category] || 'help-circle';
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.reportItem, { backgroundColor: theme.colors.surface.primary }]}
      onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category)}
            size={24}
            color={theme.colors.primary.main}
            style={styles.categoryIcon}
          />
          <View style={styles.reportDetails}>
            <Text style={[styles.reportTitle, { color: theme.colors.text.primary }]}>{item.title}</Text>
            <Text style={[styles.reportLocation, { color: theme.colors.text.secondary }]}>{item.location}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <View style={[styles.reportFooter, { borderTopColor: theme.colors.border.primary }]}>
        <Text style={[styles.reportDate, { color: theme.colors.text.secondary }]}>Created: {item.createdAt}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.text.secondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={64}
            color={theme.colors.status.error}
          />
          <Text style={[styles.errorText, { color: theme.colors.status.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, {
              backgroundColor: theme.colors.primary.main + '20',
              borderColor: theme.colors.primary.main
            }]}
            onPress={() => {
              setLoading(true);
              fetchReports();
            }}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.primary.main} />
            <Text style={[styles.retryButtonText, { color: theme.colors.primary.main }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <View style={[styles.emptyStateHeader, {
          backgroundColor: theme.colors.surface.primary,
          borderBottomColor: theme.colors.border.primary
        }]}>
          <Text style={[styles.emptyHeaderTitle, { color: theme.colors.text.primary }]}>My Reports</Text>
          <Text style={[styles.emptyHeaderSubtitle, { color: theme.colors.text.secondary }]}>
            Track and manage all your civic issue reports in one place
          </Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={80}
            color={theme.colors.primary.main}
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.text.primary }]}>No Reports Yet</Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.secondary }]}>
            You haven't submitted any reports yet.{"\n"}
            Tap the + button below to report your first civic issue!
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading your reports...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary.main]}
            tintColor={theme.colors.primary.main}
          />
        }
        contentContainerStyle={reports.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  reportItem: {
    margin: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  reportDetails: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  reportDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
  },
  emptyStateHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  emptyHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyHeaderSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyStateSubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: 32,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MyReportsScreen;