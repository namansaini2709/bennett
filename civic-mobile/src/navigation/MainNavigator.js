import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import CreateReportScreen from '../screens/main/CreateReportScreen';
import MyReportsScreen from '../screens/main/MyReportsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ReportDetailScreen from '../screens/main/ReportDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="HomeList" component={HomeScreen} options={{ title: 'Civic Setu' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
    </Stack.Navigator>
  );
};

const MyReportsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="MyReportsList" component={MyReportsScreen} options={{ title: 'My Reports' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CreateReport') {
            iconName = 'plus-circle';
          } else if (route.name === 'MyReports') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="CreateReport" component={CreateReportScreen} options={{ title: 'Report Issue' }} />
      <Tab.Screen name="MyReports" component={MyReportsStack} options={{ title: 'My Reports' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;