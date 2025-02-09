import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import 'tailwindcss/tailwind.css';
import { RootStackParamList } from '../navigation/types';
import LocationService from '../utils/LocationService';
import supabase  from '../services/supabase';

const cities = [
  { label: 'Taipei', value: 'taipei' },
  { label: 'New Taipei', value: 'new_taipei' },
  { label: 'Taichung', value: 'taichung' },
  { label: 'Tainan', value: 'tainan' },
  { label: 'Kaohsiung', value: 'kaohsiung' },
  { label: 'Keelung', value: 'keelung' },
  { label: 'Hsinchu', value: 'hsinchu' },
  { label: 'Hsinchu County', value: 'hsinchu_county' },
  { label: 'Miaoli', value: 'miaoli' },
  { label: 'Changhua', value: 'changhua' },
  { label: 'Nantou', value: 'nantou' },
  { label: 'Yunlin', value: 'yunlin' },
  { label: 'Chiayi', value: 'chiayi' },
  { label: 'Chiayi County', value: 'chiayi_county' },
  { label: 'Pingtung', value: 'pingtung' },
  { label: 'Yilan', value: 'yilan' },
  { label: 'Hualien', value: 'hualien' },
  { label: 'Taitung', value: 'taitung' },
  { label: 'Penghu', value: 'penghu' },
  { label: 'Kinmen', value: 'kinmen' },
  { label: 'Lienchiang', value: 'lienchiang' },
];

type LocationSelectionScreenRouteProp = RouteProp<RootStackParamList, 'LocationSelection'>;

const LocationSelectionScreen = () => {
  const [location, setLocation] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(cities);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<LocationSelectionScreenRouteProp>();
  const { role, subject, area, format } = route.params;

  useEffect(() => {
    const getCurrentLocation = async () => {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        const city = await LocationService.getCityFromCoordinates(
          location.latitude,
          location.longitude
        );

        // Save to profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({
              city,
              latitude: location.latitude,
              longitude: location.longitude
            })
            .eq('user_id', user.id);
        }
      }
    };

    getCurrentLocation();
  }, []);

  const handleNext = () => {
    if (location) {
      navigation.navigate('FrequencySelection', { role, name: route.params.name, subject, area, format, location });
    } else {
      Alert.alert('Error', 'Please select a location');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.title}>Select Your Location</Text>
      <DropDownPicker
        open={open}
        value={location}
        items={items}
        setOpen={setOpen}
        setValue={setLocation}
        setItems={setItems}
        searchable={true}
        placeholder="Select a city"
        containerStyle={{ width: '80%', marginBottom: 20 }}
        style={{ borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
        dropDownContainerStyle={{ backgroundColor: '#E8F5E9' }}
        searchContainerStyle={{ borderBottomColor: '#4CAF50' }}
        searchTextInputStyle={{ borderColor: '#4CAF50' }}
      />
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  nextButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LocationSelectionScreen;