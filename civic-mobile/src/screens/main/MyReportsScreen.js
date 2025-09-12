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
import { getStatusColor, getStatusLabel } from '../../constants/reportStatus';
import reportService from '../../services/reportService';
import { showErrorAlert } from '../../utils/errorHandler';

const MyReportsScreen = ({ navigation }) => {
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
        // Transform the data to match our UI expectations
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
        setError(result.message || 'Failed to fetch reports');
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      const errorMessage = error?.message?.includes('Network Error') 
        ? 'No internet connection. Please check your network and try again.'
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
      style={styles.reportItem}
      onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category)}
            size={24}
            color="#2196F3"
            style={styles.categoryIcon}
          />
          <View style={styles.reportDetails}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportLocation}>{item.location}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>Created: {item.createdAt}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#666"
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
            color="#F44336"
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              fetchReports();
            }}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#2196F3" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={64}
          color="#ccc"
        />
        <Text style={styles.emptyStateText}>No reports found</Text>
        <Text style={styles.emptyStateSubtext}>
          Tap the + button to create your first report
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  reportItem: {
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    color: '#333',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: '#666',
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
    borderTopColor: '#f0f0f0',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: 32,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  retryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MyReportsScreen;