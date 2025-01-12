// filepath: /c:/Users/PC/Documents/TutorMatchApp/src/screens/DurationSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from '../services/supabase';
import 'tailwindcss/tailwind.css';

const DurationSelectionScreen = () => {
  const [duration, setDuration] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: '30 minutes', value: '30_minutes' },
    { label: '1 hour', value: '1_hour' },
    { label: '1.5 hours', value: '1.5_hours' },
    { label: '2 hours', value: '2_hours' },
  ]);
  const navigation = useNavigation();
  const route = useRoute();
  const { role, subject, area, format, location, frequency } = route.params;

  const handleFinish = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: user.id,
          role,
          subject,
          area,
          teaching_format: format,
          location,
          frequency,
          duration,
        },
      ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-green-600 mb-5">Select Duration</Text>
      <DropDownPicker
        open={open}
        value={duration}
        items={items}
        setOpen={setOpen}
        setValue={setDuration}
        setItems={setItems}
        containerStyle={{ width: '80%', marginBottom: 20 }}
        style={{ borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
        dropDownStyle={{ backgroundColor: '#E8F5E9' }}
      />
      <TouchableOpacity className="w-4/5 p-4 bg-green-600 rounded-full" onPress={handleFinish}>
        <Text className="text-white font-bold text-center">Finish</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default DurationSelectionScreen;