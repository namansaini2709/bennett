import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCard, AnimatedButton } from '../../components/ui/AnimatedComponents';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import InfoDialog from '../../components/ui/InfoDialog';
import reportService from '../../services/reportService';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
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
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'account-edit',
      onPress: () => navigation.navigate('EditProfile')
    },
    {
      id: '2',
      title: 'My Reports',
      icon: 'file-document-multiple',
      onPress: () => navigation.navigate('MyReports')
    },
    {
      id: '3',
      title: 'Theme',
      subtitle: isDarkMode ? 'Dark Mode' : 'Light Mode',
      icon: isDarkMode ? 'weather-night' : 'weather-sunny',
      onPress: toggleTheme,
      isTheme: true
    },
    {
      id: '4',
      title: 'Notifications',
      icon: 'bell',
      onPress: () => navigation.navigate('NotificationSettings')
    },
    {
      id: '5',
      title: 'Language',
      icon: 'translate',
      onPress: () => navigation.navigate('LanguageSelection')
    },
    {
      id: '6',
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => setShowHelpDialog(true)
    },
    {
      id: '7',
      title: 'About',
      icon: 'information',
      onPress: () => setShowAboutDialog(true)
    },
    {
      id: '8',
      title: 'Logout',
      icon: 'logout',
      onPress: () => handleLogout(),
      isLogout: true
    }
  ];

  const handleLogout = () => {
    console.log('handleLogout called - showing logout dialog');
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    console.log('User confirmed logout');
    setShowLogoutDialog(false);
    performLogout();
  };

  const cancelLogout = () => {
    console.log('Logout cancelled');
    setShowLogoutDialog(false);
  };

  const performLogout = async () => {
    try {
      console.log('Logout button pressed - starting logout...');
      await logout();
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Style helper functions
  const getMenuItemStyle = () => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface.primary,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    ...Platform.select({
      ios: theme.shadows.small,
      android: { elevation: 2 },
    }),
  });

  const getLogoutItemStyle = () => ({
    backgroundColor: theme.colors.status.error + '10',
    borderWidth: 1,
    borderColor: theme.colors.status.error + '30',
  });

  const getThemeItemStyle = () => ({
    backgroundColor: theme.colors.primary.main + '10',
    borderWidth: 1,
    borderColor: theme.colors.primary.main + '30',
  });

  const getMenuTextStyle = () => ({
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
  });

  const getLogoutTextStyle = () => ({
    color: theme.colors.status.error,
  });

  const getSubtitleStyle = () => ({
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  });

  const getIconColor = (item) => {
    if (item.isLogout) return theme.colors.status.error;
    if (item.isTheme) return theme.colors.primary.main;
    return theme.colors.text.secondary;
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const renderMenuItem = (item, index) => (
    <Animatable.View
      key={item.id}
      animation="fadeInUp"
      delay={index * 100}
      duration={600}
    >
      <TouchableOpacity
        style={[
          getMenuItemStyle(),
          item.isLogout && getLogoutItemStyle(),
          item.isTheme && getThemeItemStyle()
        ]}
        onPress={() => {
          console.log(`Menu item pressed: ${item.title}`);
          item.onPress();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <View style={[
            styles.iconContainer,
            item.isLogout && styles.logoutIconContainer,
            item.isTheme && styles.themeIconContainer
          ]}>
            <MaterialCommunityIcons
              name={item.icon}
              size={22}
              color={getIconColor(item)}
            />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[
              getMenuTextStyle(),
              item.isLogout && getLogoutTextStyle()
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={getSubtitleStyle()}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        {!item.isTheme && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={item.isLogout ? theme.colors.status.error : theme.colors.text.tertiary}
          />
        )}
        {item.isTheme && (
          <View style={styles.themeToggle}>
            <View style={[
              styles.toggleTrack,
              isDarkMode && styles.toggleTrackActive
            ]}>
              <Animated.View style={[
                styles.toggleThumb,
                isDarkMode && styles.toggleThumbActive
              ]} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <Animated.ScrollView
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Header */}
        <Animated.View style={[{ minHeight: height * 0.35 }, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={theme.colors.gradient.primary}
            style={{
              flex: 1,
              paddingTop: insets.top + 10,
              paddingBottom: theme.spacing.xl,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animatable.View
              animation="fadeInDown"
              duration={800}
              style={styles.headerContent}
            >
              <View style={{
                marginBottom: theme.spacing.md,
                borderRadius: 50,
                overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={[theme.colors.background.secondary, theme.colors.surface.primary]}
                  style={styles.avatarGradient}
                >
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={80}
                    color={theme.colors.primary.main}
                  />
                </LinearGradient>
              </View>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: theme.colors.text.contrast,
                marginBottom: theme.spacing.xs,
                textAlign: 'center',
              }}>{user.name}</Text>
              <Text style={{
                fontSize: 16,
                color: theme.colors.text.contrast + 'CC',
                marginBottom: theme.spacing.lg,
                textAlign: 'center',
              }}>{user.email}</Text>

              {/* Animated Stats */}
              <Animatable.View
                animation="slideInUp"
                delay={300}
                duration={800}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: width - theme.spacing.xl,
                  justifyContent: 'space-between',
                }}
              >
                <AnimatedCard style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.surface.primary + 'F0',
                  borderRadius: theme.borderRadius.lg,
                  marginHorizontal: theme.spacing.xs,
                }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.colors.primary.main,
                  }}>{user.reportsCount}</Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.xs,
                    fontWeight: '500',
                  }}>Reports</Text>
                </AnimatedCard>
                <View style={{ width: theme.spacing.sm }} />
                <AnimatedCard style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.surface.primary + 'F0',
                  borderRadius: theme.borderRadius.lg,
                  marginHorizontal: theme.spacing.xs,
                }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.colors.primary.main,
                  }}>
                    {user.joinDate ? new Date(user.joinDate).getFullYear() : new Date().getFullYear()}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.xs,
                    fontWeight: '500',
                  }}>Member Since</Text>
                </AnimatedCard>
              </Animatable.View>
            </Animatable.View>
          </LinearGradient>
        </Animated.View>

        {/* Personal Information */}
        <Animatable.View
          animation="fadeInUp"
          delay={500}
          duration={800}
          style={{
            marginTop: -theme.spacing.xl,
          }}
        >
          <View style={{
            margin: theme.spacing.md,
            backgroundColor: theme.colors.surface.primary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            ...Platform.select({
              ios: theme.shadows.medium,
              android: { elevation: 4 },
            }),
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.md,
            }}>Personal Information</Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              backgroundColor: theme.colors.background.secondary,
              marginBottom: theme.spacing.xs,
              borderRadius: theme.borderRadius.md,
            }}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color={theme.colors.primary.main}
              />
              <Text style={{
                fontSize: 16,
                color: theme.colors.text.primary,
                marginLeft: theme.spacing.md,
                flex: 1,
              }}>{user.phone}</Text>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              backgroundColor: theme.colors.background.secondary,
              marginBottom: theme.spacing.xs,
              borderRadius: theme.borderRadius.md,
            }}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={theme.colors.primary.main}
              />
              <Text style={{
                fontSize: 16,
                color: theme.colors.text.primary,
                marginLeft: theme.spacing.md,
                flex: 1,
              }}>{user.location}</Text>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              backgroundColor: theme.colors.background.secondary,
              marginBottom: theme.spacing.xs,
              borderRadius: theme.borderRadius.md,
            }}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={theme.colors.primary.main}
              />
              <Text style={{
                fontSize: 16,
                color: theme.colors.text.primary,
                marginLeft: theme.spacing.md,
                flex: 1,
              }}>
                Joined {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Menu Items */}
        <Animatable.View
          animation="fadeInUp"
          delay={700}
          duration={800}
        >
          <View style={{
            margin: theme.spacing.md,
            backgroundColor: theme.colors.surface.primary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            ...Platform.select({
              ios: theme.shadows.medium,
              android: { elevation: 4 },
            }),
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.md,
            }}>Settings</Text>
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </View>
        </Animatable.View>

        {/* App Version */}
        <Animatable.View
          animation="fadeIn"
          delay={900}
          duration={800}
          style={{
            alignItems: 'center',
            padding: theme.spacing.xl,
            marginBottom: theme.spacing.lg,
          }}
        >
          <Text style={{
            fontSize: 14,
            color: theme.colors.text.secondary,
            fontWeight: '500',
          }}>Civic Setu v1.0.0</Text>
          <Text style={{
            fontSize: 12,
            color: theme.colors.text.tertiary,
            marginTop: theme.spacing.xs,
          }}>
            Made with ❤️ for Jharkhand Citizens
          </Text>
        </Animatable.View>
      </Animated.ScrollView>

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        confirmStyle="destructive"
        icon="logout"
      />

      <InfoDialog
        visible={showHelpDialog}
        title="Help & Support"
        message={`For support, please contact:

Email: admin@civicsetu.com
Phone: +91 9876543210`}
        onClose={() => setShowHelpDialog(false)}
        icon="help-circle"
      />

      <InfoDialog
        visible={showAboutDialog}
        title="About Civic Setu"
        message={`We at Civic Setu are for the people of Jharkhand.

Version: 1.0.0`}
        onClose={() => setShowAboutDialog(false)}
        icon="information"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginRight: 12,
  },
  logoutIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  themeIconContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
  },
  menuTextContainer: {
    flex: 1,
  },
  themeToggle: {
    marginLeft: 12,
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#667eea',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    transform: [{ translateX: 0 }],
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
});

export default ProfileScreen;