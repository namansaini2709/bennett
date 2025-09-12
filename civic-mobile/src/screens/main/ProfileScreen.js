import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import reportService from '../../services/reportService';

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState({
    name: authUser?.name || 'User',
    email: authUser?.email || 'No email provided',
    phone: authUser?.phone || 'No phone provided',
    location: typeof authUser?.address === 'string' 
      ? authUser.address 
      : authUser?.address?.city || 'No location provided',
    reportsCount: 0,
    joinDate: authUser?.createdAt 
      ? (typeof authUser.createdAt === 'string' 
          ? authUser.createdAt.split('T')[0] 
          : new Date(authUser.createdAt).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchUserReportCount();
  }, []);

  const fetchUserReportCount = async () => {
    try {
      const result = await reportService.getMyReports();
      if (result.success && result.data) {
        setUser(prevUser => ({
          ...prevUser,
          reportsCount: result.data.length
        }));
      }
    } catch (error) {
      console.error('Error fetching user report count:', error);
      // Keep default value of 0 if error occurs
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'account-edit',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing feature will be available soon!')
    },
    {
      id: '2',
      title: 'My Reports',
      icon: 'file-document-multiple',
      onPress: () => navigation.navigate('MyReports')
    },
    {
      id: '3',
      title: 'Notifications',
      icon: 'bell',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon!')
    },
    {
      id: '4',
      title: 'Language',
      icon: 'translate',
      onPress: () => Alert.alert('Coming Soon', 'Language selection will be available soon!')
    },
    {
      id: '5',
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => Alert.alert('Help & Support', 'For support, please contact:\nEmail: support@civicsetu.com\nPhone: +91 1234567890')
    },
    {
      id: '6',
      title: 'About',
      icon: 'information',
      onPress: () => Alert.alert('About Civic Setu', 'Civic Setu v1.0.0\nCrowdsourced Civic Issue Reporting Platform\nMade for Jharkhand Citizens')
    },
    {
      id: '7',
      title: 'Logout',
      icon: 'logout',
      onPress: () => handleLogout(),
      isLogout: true
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout }
      ]
    );
  };

  const performLogout = async () => {
    try {
      await logout();
      // Navigate back to Auth stack after successful logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, item.isLogout && styles.logoutItem]}
      onPress={item.onPress}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={24}
        color={item.isLogout ? '#F44336' : '#666'}
        style={styles.menuIcon}
      />
      <Text style={[styles.menuText, item.isLogout && styles.logoutText]}>
        {item.title}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={item.isLogout ? '#F44336' : '#ccc'}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons
            name="account-circle"
            size={80}
            color="#2196F3"
          />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.reportsCount}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user.joinDate ? new Date(user.joinDate).getFullYear() : new Date().getFullYear()}
            </Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="phone" size={20} color="#666" />
          <Text style={styles.infoText}>{user.phone}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
          <Text style={styles.infoText}>{user.location}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          <Text style={styles.infoText}>
            Joined {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {menuItems.map(renderMenuItem)}
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Civic Setu v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 12,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuSection: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#F44336',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen;