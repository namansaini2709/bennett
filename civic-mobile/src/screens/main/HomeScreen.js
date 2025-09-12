import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Card, Chip, FAB, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL, REPORT_STATUS, CATEGORIES } from '../../constants/config';

const HomeScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [selectedCategory]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await axios.get(`${API_BASE_URL}/reports`, { params });
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      road_issue: 'road',
      water_supply: 'water',
      electricity: 'flash',
      garbage: 'trash-can',
      drainage: 'pipe',
      street_light: 'lamp',
      traffic: 'traffic-light',
      pollution: 'cloud-alert',
      encroachment: 'home-alert',
      other: 'alert-circle'
    };
    return icons[category] || 'alert-circle';
  };

  const renderReport = ({ item }) => {
    const status = REPORT_STATUS[item.status];
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ReportDetail', { reportId: item._id })}
      >
        <Card style={styles.reportCard}>
          <Card.Content>
            <View style={styles.reportHeader}>
              <MaterialCommunityIcons
                name={getCategoryIcon(item.category)}
                size={24}
                color="#2196F3"
              />
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.reportLocation} numberOfLines={1}>
                  {item.location.address}
                </Text>
              </View>
              <Chip
                style={[styles.statusChip, { backgroundColor: status.color }]}
                textStyle={styles.statusText}
              >
                {status.label}
              </Chip>
            </View>
            <Text style={styles.reportDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.reportFooter}>
              <Text style={styles.reportDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <View style={styles.reportStats}>
                <MaterialCommunityIcons name="thumb-up-outline" size={16} color="#666" />
                <Text style={styles.statText}>{item.upvotes?.length || 0}</Text>
                <MaterialCommunityIcons name="comment-outline" size={16} color="#666" style={{ marginLeft: 10 }} />
                <Text style={styles.statText}>{item.comments?.length || 0}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search reports..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <FlatList
        data={filteredReports}
        renderItem={renderReport}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateReport')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 10,
    elevation: 2,
  },
  reportCard: {
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reportLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  reportStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default HomeScreen;