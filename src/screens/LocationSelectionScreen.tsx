// filepath: /c:/Users/PC/Documents/TutorMatchApp/src/screens/LocationSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import 'tailwindcss/tailwind.css';

const LocationSelectionScreen = () => {
  const [location, setLocation] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'City 1', value: 'city1' },
    { label: 'City 2', value: 'city2' },
    { label: 'City 3', value: 'city3' },
  ]);
  const navigation = useNavigation();
  const route = useRoute();
  const { role, subject, area, format } = route.params;

  const handleNext = () => {
    if (location) {
      navigation.navigate('FrequencySelection', { role, subject, area, format, location });
    } else {
      Alert.alert('Error', 'Please select a location');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-green-600 mb-5">Select Your Location</Text>
      <DropDownPicker
        open={open}
        value={location}
        items={items}
        setOpen={setOpen}
        setValue={setLocation}
        setItems={setItems}
        containerStyle={{ width: '80%', marginBottom: 20 }}
        style={{ borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
        dropDownStyle={{ backgroundColor: '#E8F5E9' }}
      />
      <TouchableOpacity className="w-4/5 p-4 bg-green-600 rounded-full" onPress={handleNext}>
        <Text className="text-white font-bold text-center">Next</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default LocationSelectionScreen;