import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, BarChart2, Settings, MessageCircle } from 'lucide-react-native';
import TutorHomeScreen from '../screens/tutor/TutorHomeScreen';
import TutorScheduleScreen from '../screens/tutor/TutorScheduleScreen';
import TutorAnalyticsScreen from '../screens/tutor/TutorAnalyticsScreen';
import TutorSettingsScreen from '../screens/tutor/TutorSettingsScreen';
import TutorMessagesScreen from '../screens/tutor/TutorMessagesScreen';

const Tab = createBottomTabNavigator();

const TutorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#084843',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="TutorHome"
        component={TutorHomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={TutorScheduleScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={TutorMessagesScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={TutorAnalyticsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="TutorSettings"
        component={TutorSettingsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TutorTabNavigator;
