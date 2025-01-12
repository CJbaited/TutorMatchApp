// filepath: /c:/Users/PC/Documents/TutorMatchApp/src/screens/FrequencySelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import 'tailwindcss/tailwind.css';

const FrequencySelectionScreen = () => {
  const [frequency, setFrequency] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: '1x a week', value: '1x_week' },
    { label: '2x a week', value: '2x_week' },
    { label: '3x a week', value: '3x_week' },
    { label: '4x a week', value: '4x_week' },
    { label: '5x a week', value: '5x_week' },
  ]);
  const navigation = useNavigation();
  const route = useRoute();
  const { role, subject, area, format, location } = route.params;

  const handleNext = () => {
    if (frequency) {
      navigation.navigate('DurationSelection', { role, subject, area, format, location, frequency });
    } else {
      Alert.alert('Error', 'Please select a frequency');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-green-600 mb-5">Select Frequency</Text>
      <DropDownPicker
        open={open}
        value={frequency}
        items={items}
        setOpen={setOpen}
        setValue={setFrequency}
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

export default FrequencySelectionScreen;