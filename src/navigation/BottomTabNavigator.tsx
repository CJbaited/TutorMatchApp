import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform } from 'react-native';
import { Home, Search, Heart, MessageCircle } from 'lucide-react-native';
import { colors } from '../theme/Theme';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import MessagesScreen from '../screens/MessagesScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconSize = 24;
          switch (route.name) {
            case 'HomeTab':
              return <Home size={iconSize} color={color} />;
            case 'Explore':
              return <Search size={iconSize} color={color} />;
            case 'Favorites':
              return <Heart size={iconSize} color={color} />;
            case 'Messages':
              return <MessageCircle size={iconSize} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          ...styles.tabBar,
          zIndex: 1, // Lower zIndex for the tab bar
        },
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
        headerShown: false,
        
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{tabBarLabel: "Home"}} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFF',
    height: Platform.OS === 'ios' ? 84 : 74,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tabBarLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomTabNavigator;