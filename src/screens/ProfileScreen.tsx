import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, 
  TextInput, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { compressImage, validateImage } from '../utils/ImageUtils';
import { colors } from '../theme/Theme';
import supabase from '../services/supabase';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

const ProfileScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    city: '',
    latitude: null,
    longitude: null,
    bio: '',
    image_url: null
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setProfileData({
          name: profile.name || '',
          email: user.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          city: profile.city || '',
          latitude: profile.latitude || null,
          longitude: profile.longitude || null,
          bio: profile.bio || '',
          image_url: profile.image_url
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      setIsUploading(true);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (result.canceled) return;

      const base64FileData = result.assets[0].base64;
      const filePath = `${Date.now()}.${result.assets[0].uri.split('.').pop()}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64FileData), {
          contentType: `image/${result.assets[0].uri.split('.').pop()}`
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ image_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, image_url: publicUrl }));
      Alert.alert('Success', 'Profile picture updated');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          location: profileData.location,
          bio: profileData.bio
        })
        .eq('user_id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const address = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      setProfileData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        location: address,
        city: address.split(',')[0].trim()
      }));

      // Update in database
      await updateLocationInDatabase(
        location.coords.latitude,
        location.coords.longitude,
        address
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (response[0]) {
        const { city, region, country } = response[0];
        return `${city}, ${region}, ${country}`;
      }
      return '';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    }
  };

  const updateLocationInDatabase = async (
    latitude: number,
    longitude: number,
    address: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('profiles')
        .update({
          latitude,
          longitude,
          location: address,
          city: address.split(',')[0].trim()
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'TutorMatchApp/1.0', // Replace with your app name/version
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching locations:', error);
      Alert.alert('Error', 'Failed to search locations');
    }
  };

  const handleLocationSelect = async (item: any) => {
    try {
      const latitude = parseFloat(item.lat);
      const longitude = parseFloat(item.lon);
      const address = item.display_name;

      setProfileData(prev => ({
        ...prev,
        latitude,
        longitude,
        location: address,
        city: item.address?.city || item.address?.town || address.split(',')[0].trim()
      }));

      await updateLocationInDatabase(latitude, longitude, address);
      setShowLocationModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to set selected location');
    }
  };

  const renderLocationSection = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Location</Text>
      <View style={styles.locationContainer}>
        <TouchableOpacity 
          style={styles.getCurrentLocationButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="location" size={24} color={colors.primary} />
          <Text style={styles.getCurrentLocationText}>Get Current Location</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>- OR -</Text>

        <TouchableOpacity 
          style={styles.searchLocationButton}
          onPress={() => setShowLocationModal(true)}
        >
          <Ionicons name="search" size={24} color={colors.primary} />
          <Text style={styles.searchLocationText}>Search Location</Text>
        </TouchableOpacity>

        {profileData.location ? (
          <View style={styles.detectedLocation}>
            <Text style={styles.locationText}>{profileData.location}</Text>
            <Text style={styles.coordinatesText}>
              {profileData.latitude && profileData.longitude 
                ? `${profileData.latitude.toFixed(4)}, ${profileData.longitude.toFixed(4)}`
                : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={
                profileData.image_url 
                  ? { uri: profileData.image_url }
                  : require('../assets/placeholder-person.jpg')
              } 
              style={styles.profileImage} 
            />
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleImagePicker}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Camera size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text) => setProfileData({...profileData, name: text})}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profileData.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(text) => setProfileData({...profileData, phone: text})}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          {renderLocationSection()}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Detected Location</Text>
            <View style={styles.detectedLocation}>
              <Text style={styles.locationText}>
                {profileData.city ? `${profileData.city}` : 'Location not detected'}
              </Text>
              <Text style={styles.coordinatesText}>
                {profileData.latitude && profileData.longitude 
                  ? `${profileData.latitude.toFixed(4)}, ${profileData.longitude.toFixed(4)}`
                  : ''}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData({...profileData, bio: text})}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity 
            style={[styles.updateButton, isLoading && styles.disabledButton]}
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        isVisible={showLocationModal}
        onBackdropPress={() => setShowLocationModal(false)}
        onBackButtonPress={() => setShowLocationModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Location</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchLocations(text);
              }}
              placeholder="Search for a location..."
              placeholderTextColor="#666"
            />
          </View>

          <ScrollView style={styles.resultsContainer}>
            {searchResults.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => handleLocationSelect(item)}
              >
                <Text style={styles.resultText}>{item.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  formSection: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#666',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  detectedLocation: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
  },
  updateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  getCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  getCurrentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  searchLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  searchLocationText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 8,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  resultsContainer: {
    maxHeight: 400,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  }
});

export default ProfileScreen;