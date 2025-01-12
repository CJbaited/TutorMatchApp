// filepath: /c:/Users/PC/Documents/TutorMatchApp/src/screens/SubjectSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import 'tailwindcss/tailwind.css';

const SubjectSelectionScreen = () => {
  const [subject, setSubject] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { role } = route.params;

  const handleNext = () => {
    if (subject) {
      navigation.navigate('AreaSelection', { role, subject });
    } else {
      Alert.alert('Error', 'Please select a subject');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-green-600 mb-5">Select Your Subject</Text>
      <TextInput
        className="w-4/5 p-4 border border-green-600 rounded-full mb-5 bg-green-100 text-gray-800"
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity className="w-4/5 p-4 bg-green-600 rounded-full" onPress={handleNext}>
        <Text className="text-white font-bold text-center">Next</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default SubjectSelectionScreen;