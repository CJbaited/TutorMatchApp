import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Pressable,
  Animated,
  Dimensions,
  PanResponder,
  Platform
} from 'react-native';
import { X, ChevronRight, User, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../services/supabase';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { MessageCircle, Settings, HelpCircle, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

type MenuOption = {
  label: string;
  onPress: () => void;
  icon?: JSX.Element;
  group?: string;
};

type DrawerMenuProps = {
  isVisible: boolean;
  onClose: () => void;
};

const DrawerMenu = ({ isVisible, onClose }: DrawerMenuProps) => {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);


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
        setUserName(profile.name || user.email);
        setProfileImage(profile.image_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(); // This comes from useAuth() hook
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuOptions: MenuOption[] = [
    // Profile & Account Group
    { 
      label: 'Profile', 
      onPress: () => navigation.navigate('Profile'),
      icon: <User size={24} color="#084843" />,
      group: 'account'
    },
    {
      label: 'My Preferences',
      onPress: () => navigation.navigate('Preferences'),
      icon: <Settings size={24} color="#084843" />,
      group: 'account'
    },
    // Bookings Group
    {
      label: 'My Bookings',
      onPress: () => navigation.navigate('Bookings'),
      icon: <Calendar size={24} color="#084843" />,
      group: 'bookings'
    },
    // Support Group
    {
      label: 'Settings',
      onPress: () => navigation.navigate('Settings'),
      icon: <Settings size={24} color="#084843" />,
      group: 'support'
    },
    {
      label: 'Help Center',
      onPress: () => navigation.navigate('HelpCenter'),
      icon: <HelpCircle size={24} color="#084843" />,
      group: 'support'
    },
  ];

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx < 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -DRAWER_WIDTH / 2) {
          closeDrawer();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  useEffect(() => {
    if (isVisible) {
      openDrawer();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const renderMenuSections = () => {
    const groupedOptions = menuOptions.reduce((acc, option) => {
      const group = option.group || 'other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    }, {});

    return (
      <View style={styles.menuOptions}>
        {Object.entries(groupedOptions).map(([group, options]) => (
          <View key={group} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </Text>
            {options.map((option: MenuOption, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={option.onPress}
              >
                {option.icon && (
                  <View style={styles.menuItemIcon}>{option.icon}</View>
                )}
                <Text style={styles.menuItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={24} color="#FF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Pressable style={styles.overlayPressable} onPress={closeDrawer} />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
            <X size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Image
              source={ profileImage 
                ? { uri: profileImage }
                : require('../assets/placeholder-person.jpg')
            }
              style={styles.avatar}
            />
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        {renderMenuSections()}
      </Animated.View>
    </View>
  );
};

const CustomDrawerContent = (props) => {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      <LinearGradient
        colors={['#084843', '#0a5c55']}
        style={styles.profileSection}
      >
        <Image
          source={profileImage ? { uri: profileImage } : require('../assets/placeholder-person.jpg')}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userName || 'User Name'}</Text>
        <Text style={styles.profileEmail}>{userEmail || 'user@example.com'}</Text>
      </LinearGradient>

      <View style={styles.drawerContent}>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Messages')}
        >
          <MessageCircle size={24} color="#084843" />
          <Text style={styles.drawerItemText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Settings')}
        >
          <Settings size={24} color="#084843" />
          <Text style={styles.drawerItemText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('HelpCenter')}
        >
          <HelpCircle size={24} color="#084843" />
          <Text style={styles.drawerItemText}>Help Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={24} color="#FF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Increased zIndex to be above everything
    elevation: 9999, // For Android
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFF',
    paddingTop: 48,
    zIndex: 10000, // Even higher zIndex for the drawer itself
    elevation: 10000, // For Android
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#F0F0F0', // Placeholder background
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuOptions: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  section: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  logoutSection: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    marginLeft: 12,
  },
  drawerContainer: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  drawerContent: {
    padding: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
    ...Platform.select({
      ios: {
        shadowColor: '#FF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  signOutText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4444',
  },
});

// Update the Drawer Navigator configuration
const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: '80%',
          backgroundColor: '#FFF',
          zIndex: 9999,
          elevation: 9999,
        },
        overlayColor: 'rgba(0,0,0,0.7)',
        drawerType: 'front',
      }}
      useLegacyImplementation={false} // Ensures modern drawer behavior
    >
      <Drawer.Screen name="HomeTab" component={TabNavigator} options={{ headerShown: false }} />
      <Drawer.Screen name="Messages" component={MessagesScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="HelpCenter" component={HelpCenterScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerMenu;
