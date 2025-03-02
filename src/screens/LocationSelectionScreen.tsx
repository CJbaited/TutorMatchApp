import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  TextInput, 
  FlatList, 
  Modal, 
  ActivityIndicator
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import * as Location from 'expo-location';
import LocationService from '../utils/LocationService';
import supabase from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

type LocationSelectionScreenRouteProp = RouteProp<RootStackParamList, 'LocationSelection'>;

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
}

const LocationSelectionScreen = () => {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const mapRef = useRef<any>(null);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<LocationSelectionScreenRouteProp>();
  const { role, subject, area, format } = route.params;

  // Request location permissions when component mounts
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Please enable location services to use this feature.');
        return;
      }

      setIsLoading(true);
      const currentLocation = await LocationService.getCurrentLocation();
      
      if (currentLocation) {
        const { latitude, longitude } = currentLocation;
        setLatitude(latitude);
        setLongitude(longitude);
        
        // Get address from coordinates
        const address = await reverseGeocode(latitude, longitude);
        setSelectedAddress(address);
        setLocation(address);
        
        // Save to profile if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await LocationService.updateUserLocation(supabase, user.id);
        }
      }
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
        return `${city || ''}, ${region || ''}, ${country || ''}`.replace(/^, |, $/g, '');
      }
      return '';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    }
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'TutorMatchApp/1.0',
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async (item: LocationResult) => {
    try {
      const latitude = parseFloat(item.lat);
      const longitude = parseFloat(item.lon);
      const address = item.display_name;

      setLatitude(latitude);
      setLongitude(longitude);
      setSelectedAddress(address);
      setLocation(address);
      
      const city = item.address?.city || item.address?.town || address.split(',')[0].trim();
      
      // Save to profile if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            city,
            latitude,
            longitude,
            location: address
          })
          .eq('user_id', user.id);
      }
      
      setShowLocationModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to set selected location');
    }
  };

  const handleNext = () => {
    if (location) {
      navigation.navigate('FrequencySelection', { 
        role, 
        name: route.params.name, 
        subject, 
        area, 
        format,
        location,
        latitude,
        longitude 
      });
    } else {
      Alert.alert('Error', 'Please select a location');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Where Are You Located?</Text>
        <Text style={styles.subtitle}>
          We'll use this to find tutors or students in your area
        </Text>
      </View>
      
      <View style={styles.locationContainer}>
        {selectedAddress ? (
          <View style={styles.selectedLocationContainer}>
            <Ionicons name="location" size={24} color="#084843" />
            <Text style={styles.selectedLocationText}>{selectedAddress}</Text>
          </View>
        ) : null}
        
        {latitude && longitude ? (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
            >
              <Marker
                coordinate={{ latitude, longitude }}
                pinColor="#084843"
              />
            </MapView>
          </View>
        ) : null}

        <TouchableOpacity 
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="location" size={24} color="#FFF" />
          <Text style={styles.locationButtonText}>Use My Current Location</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setShowLocationModal(true)}
        >
          <Ionicons name="search" size={24} color="#FFF" />
          <Text style={styles.searchButtonText}>Search for a Location</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, !location && styles.disabledButton]}
        onPress={handleNext}
        disabled={!location}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      {/* Location Search Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Search Location</Text>
            
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={24} color="#084843" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cities, addresses..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.length >= 3) {
                    searchLocations(text);
                  }
                }}
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color="#084843" />
              </TouchableOpacity>
            </View>

            {isLoading && (
              <ActivityIndicator size="large" color="#084843" style={styles.loading} />
            )}

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.place_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleLocationSelect(item)}
                >
                  <Ionicons name="location-outline" size={24} color="#084843" />
                  <Text style={styles.resultText}>{item.display_name}</Text>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#084843" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#084843',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedLocationText: {
    color: '#084843',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#084843',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    marginBottom: 15,
  },
  locationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 15,
    width: '100%',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: '#084843',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#084843',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
    color: '#333',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  loading: {
    marginVertical: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#084843',
  }
});

export default LocationSelectionScreen;