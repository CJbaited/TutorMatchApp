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
  PanResponder
} from 'react-native';
import { X, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../services/supabase';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

type MenuOption = {
  label: string;
  onPress: () => void;
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
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuOptions: MenuOption[] = [
    { label: 'Profile', onPress: () => navigation.navigate('Profile') },
    { label: 'My Preferences', onPress: () => navigation.navigate('Preferences') },
    { label: 'My Bookings', onPress: () => navigation.navigate('Bookings') },
    { label: 'Settings', onPress: () => navigation.navigate('Settings') },
    { label: 'FAQ', onPress: () => navigation.navigate('FAQ') },
    { 
      label: 'Logout', 
      onPress: handleLogout,
      danger: true // Add this to style differently
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

        <View style={styles.menuOptions}>
          {menuOptions.map((option, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
                option.danger && styles.menuItemDanger
              ]}
              onPress={option.onPress}
            >
              <Text style={[
                styles.menuItemText,
                option.danger && styles.menuItemTextDanger
              ]}>{option.label}</Text>
              <ChevronRight size={20} color="#666" />
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemPressed: {
    backgroundColor: '#F8F9FA',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 'auto', // Push to bottom
  },
  menuItemTextDanger: {
    color: '#FF4444',
  },
});

export default DrawerMenu;
