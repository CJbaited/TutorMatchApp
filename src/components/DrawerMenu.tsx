import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Bell,
  Calendar,
  MessageCircle,
  ChevronRight
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../services/supabase';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.85, 400);

interface DrawerMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isVisible, onClose }) => {
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [isVisible]);

  const handleClose = () => {
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
    overlayOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  // Pan Gesture for Horizontal Drawer Drag
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      const newX = ctx.startX + event.translationX;
      translateX.value = Math.min(0, Math.max(-DRAWER_WIDTH, newX));
      overlayOpacity.value = interpolate(
        translateX.value,
        [-DRAWER_WIDTH, 0],
        [0, 1],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      // If user swipes left quickly or the drawer is more than 1/3 closed, close it
      const shouldClose =
        event.velocityX < -500 || translateX.value < -DRAWER_WIDTH / 3;
      if (shouldClose) {
        runOnJS(handleClose)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        overlayOpacity.value = withTiming(1, { duration: 200 });
      }
    },
  });

  // Animations for Drawer & Overlay
  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserName(profile.name || 'User');
        setUserEmail(user.email || '');
        setProfileImage(profile.image_url || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserName('User');
      setUserEmail('');
      setProfileImage(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      title: 'Account',
      items: [
        {
          label: 'Profile',
          icon: <User size={24} color="#084843" />,
          onPress: () => navigation.navigate('Profile'),
        },
        {
          label: 'Notifications',
          icon: <Bell size={24} color="#084843" />,
          onPress: () => navigation.navigate('Notifications'),
        },
      ],
    },
    {
      title: 'Activities',
      items: [
        {
          label: 'Messages',
          icon: <MessageCircle size={24} color="#084843" />,
          onPress: () => navigation.navigate('Messages'),
        },
        {
          label: 'Bookings',
          icon: <Calendar size={24} color="#084843" />,
          onPress: () => navigation.navigate('Bookings'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          label: 'Settings',
          icon: <Settings size={24} color="#084843" />,
          onPress: () => navigation.navigate('Settings'),
        },
        {
          label: 'Help Center',
          icon: <HelpCircle size={24} color="#084843" />,
          onPress: () => navigation.navigate('HelpCenter'),
        },
      ],
    },
  ];

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Dimmed overlay */}
      <Animated.View
        style={[styles.overlay, overlayAnimatedStyle]}
        pointerEvents={isVisible ? 'auto' : 'none'}
      >
        <Pressable style={styles.overlayPressable} onPress={handleClose} />
      </Animated.View>

      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetX={[-20, 20]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View style={[styles.drawer, drawerAnimatedStyle]}>
          <SafeAreaView style={styles.drawerContent} edges={['top', 'bottom']}>
            {/* Floating Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#333" />
            </TouchableOpacity>

            {/* Fixed Profile Header */}
            <LinearGradient
              colors={['#084843', '#0a5c55']}
              style={styles.profileSection}
            >
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require('../assets/placeholder-person.jpg')
                }
                style={styles.profileImage}
                onError={() => setProfileImage(null)}
                defaultSource={require('../assets/placeholder-person.jpg')}
              />
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </LinearGradient>

            {/* Scrollable Menu Items */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {menuItems.map((section, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.items.map((item, itemIndex) => (
                    <TouchableOpacity
                      key={itemIndex}
                      style={styles.menuItem}
                      onPress={() => {
                        item.onPress();
                        onClose();
                      }}
                    >
                      <View style={styles.menuItemContent}>
                        {item.icon}
                        <Text style={styles.menuItemText}>{item.label}</Text>
                      </View>
                      <ChevronRight size={20} color="#CCCCCC" />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {/* Sign Out Button */}
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <LogOut size={24} color="#FF4444" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  // Root container
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: Platform.OS === 'android' ? 999999 : 0,
  },

  // Dark overlay behind drawer
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999998,
  },
  overlayPressable: {
    flex: 1,
  },

  // Drawer container
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 999999,
    maxWidth: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 999999,
      },
    }),
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Close (X) button
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    right: 16,
    zIndex: 1002,
    padding: 8,
  },

  // Scrollable content
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    // Ensures we can scroll if content is taller than screen
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },

  // Profile header at top
  profileSection: {
    paddingTop: Platform.OS === 'ios' ? 80 : (StatusBar.currentHeight || 0) + 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'transparent', // Important to show gradient
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileEmail: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Menu sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 24,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Individual menu items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333333',
  },

  // Sign out button
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  signOutText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4444',
  },
});

export default DrawerMenu;
