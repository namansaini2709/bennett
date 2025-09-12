import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { REPORT_STATUS, PRIORITY_LEVELS } from '../../constants/config';
import reportService from '../../services/reportService';
import { showErrorAlert } from '../../utils/errorHandler';

const ReportDetailScreen = ({ route, navigation }) => {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    try {
      console.log('📋 Fetching report details for ID:', reportId);
      const result = await reportService.getReportById(reportId);
      
      if (result.success) {
        const reportData = result.data;
        
        // Transform the data to match our UI expectations
        const transformedReport = {
          id: reportData._id,
          title: reportData.title,
          description: reportData.description,
          category: reportData.category,
          status: reportData.status,
          priority: reportData.priority || 'medium',
          location: reportData.location?.address || 'Location not specified',
          latitude: reportData.location?.latitude,
          longitude: reportData.location?.longitude,
          reportedBy: reportData.reporterId?.name || reportData.reporterId || 'Anonymous',
          createdAt: reportData.createdAt,
          updatedAt: reportData.updatedAt,
          assignedTo: reportData.assignedTo?.name || reportData.assignedTo || null,
          estimatedCompletion: reportData.estimatedCompletion || null,
          images: reportData.media || [],
          comments: reportData.comments || [],
          upvotes: Array.isArray(reportData.upvotes) ? reportData.upvotes.length : 0
        };
        
        console.log('✅ Report details loaded:', transformedReport);
        setReport(transformedReport);
      } else {
        console.error('❌ Failed to load report:', result.message);
        showErrorAlert(new Error(result.message || 'Failed to load report details'));
      }
    } catch (error) {
      console.error('❌ Error fetching report details:', error);
      showErrorAlert(error, 'Failed to Load Report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return REPORT_STATUS[status]?.color || '#666';
  };

  const getStatusLabel = (status) => {
    return REPORT_STATUS[status]?.label || status;
  };

  const getPriorityColor = (priority) => {
    const priorityObj = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityObj?.color || '#666';
  };

  const getPriorityLabel = (priority) => {
    const priorityObj = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityObj?.label || priority;
  };

  const openLocation = () => {
    if (report?.latitude && report?.longitude) {
      const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
      Linking.openURL(url);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading report details...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color="#F44336"
        />
        <Text style={styles.errorText}>Report not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{report.title}</Text>
        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(report.status) }]}>
            <Text style={styles.badgeText}>{getStatusLabel(report.status)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(report.priority) }]}>
            <Text style={styles.badgeText}>{getPriorityLabel(report.priority)}</Text>
          </View>
        </View>
      </View>

      {/* Images */}
      {report.images && report.images.length > 0 && (
        <View style={styles.imagesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {report.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.reportImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{report.description}</Text>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <TouchableOpacity onPress={openLocation}>
              <Text style={[styles.detailValue, styles.linkText]}>
                {report.location}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="account" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Reported By</Text>
            <Text style={styles.detailValue}>{report.reportedBy}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Reported On</Text>
            <Text style={styles.detailValue}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>

        {report.assignedTo && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="account-group" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Assigned To</Text>
              <Text style={styles.detailValue}>{report.assignedTo}</Text>
            </View>
          </View>
        )}

        {report.estimatedCompletion && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Estimated Completion</Text>
              <Text style={styles.detailValue}>
                {new Date(report.estimatedCompletion).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Progress Updates */}
      {report.comments && report.comments.length > 0 && (
        <View style={styles.updatesSection}>
          <Text style={styles.sectionTitle}>Progress Updates</Text>
          {report.comments.map((comment) => (
            <View key={comment.id} style={styles.updateItem}>
              <View style={styles.updateHeader}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={16}
                  color="#2196F3"
                />
                <Text style={styles.updateAuthor}>{comment.createdBy}</Text>
                <Text style={styles.updateDate}>{formatDate(comment.createdAt)}</Text>
              </View>
              <Text style={styles.updateText}>{comment.text}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#F44336',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imagesSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  reportImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  detailsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  updatesSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  updateItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  updateDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  updateText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default ReportDetailScreen;