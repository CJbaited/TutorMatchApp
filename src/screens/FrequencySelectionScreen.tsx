import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import 'tailwindcss/tailwind.css';
import { RootStackParamList } from '../navigation/types';

type FrequencySelectionScreenRouteProp = RouteProp<RootStackParamList, 'FrequencySelection'>;

const frequencies = [
  { label: '1x a week', value: '1x_week' },
  { label: '2x a week', value: '2x_week' },
  { label: '3x a week', value: '3x_week' },
  { label: '4x a week', value: '4x_week' },
  { label: '5x a week', value: '5x_week' },
  { label: '1x every 2 weeks', value: '1x_2weeks' },
  { label: '1x every 3 weeks', value: '1x_3weeks' },
];

const FrequencySelectionScreen = () => {
  const [frequency, setFrequency] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<FrequencySelectionScreenRouteProp>();
  const { role, subject, area, format, location } = route.params;

  const handleNext = () => {
    if (frequency) {
      navigation.navigate('DurationSelection', { role, subject, area, format, location, frequency });
    } else {
      Alert.alert('Error', 'Please select a frequency');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.title}>Select Frequency</Text>
      <View style={styles.buttonContainer}>
        {frequencies.map((freq) => (
          <TouchableOpacity
            key={freq.value}
            style={[styles.button, frequency === freq.value && styles.selectedButton]}
            onPress={() => setFrequency(freq.value)}
          >
            <Text style={[styles.buttonText, frequency === freq.value && styles.selectedButtonText]}>
              {freq.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: '#fff',
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

export default FrequencySelectionScreen;