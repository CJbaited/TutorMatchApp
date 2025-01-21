import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react-native';
import { colors } from '../theme/Theme';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue 
} from 'react-native-reanimated';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  // Calculate tab width accounting for horizontal margins
  const screenWidth = Dimensions.get('window').width;
  const tabBarWidth = screenWidth - 32; // 40 = left(20) + right(20) margin
  const tabWidth = tabBarWidth / 5; // 5 tabs

  // Update offsetX calculation
  const offsetX = useSharedValue(tabWidth / 2 - 3); // Center in first tab (-3 is half of dot width)

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconSize = 34; // Reduced from 48
          switch (route.name) {
            case 'Home':
              return <Home size={iconSize} color={color} />;
            case 'Explore':
              return <Search size={iconSize} color={color} />;
            case 'Favorites':
              return <Heart size={iconSize} color={color} />;
            case 'Messages':
              return <MessageCircle size={iconSize} color={color} />;
            case 'Profile':
              return <User size={iconSize} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#666',
        tabBarStyle: [styles.tabBar],
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <Animated.View
              style={[
                styles.indicator,
                useAnimatedStyle(() => ({
                  transform: [{ translateX: withSpring(offsetX.value) }],
                })),
              ]}
            />
          </View>
        ),
        tabBarItemStyle: {
          paddingVertical: 16, // Adjust this value to move icons up/down
        },
      })}
      screenListeners={({ navigation }) => ({
        state: (e) => {
          const index = navigation.getState().index;
          offsetX.value = (index * tabWidth) + (tabWidth / 2 - 3);
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        initialParams={{ role: 'student' }}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    alignSelf: 'center',
    marginHorizontal: Platform.OS === 'ios' ? 16 : 8,
    bottom: 40,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 25,
    backgroundColor: 'transparent',
    elevation: 0,
    borderTopWidth: 0,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    top: 12,
    // Remove left positioning as it's handled by transform
  },
});

export default BottomTabNavigator;