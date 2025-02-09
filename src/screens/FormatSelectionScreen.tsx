import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import 'tailwindcss/tailwind.css';
import { RootStackParamList } from '../navigation/types';

type FormatSelectionScreenRouteProp = RouteProp<RootStackParamList, 'FormatSelection'>;

const FormatSelectionScreen = () => {
  const [format, setFormat] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<FormatSelectionScreenRouteProp>();
  const { role, subject, area } = route.params;

  const handleNext = () => {
    if (format) {
      if (format === 'face_to_face' || format === 'hybrid') {
        navigation.navigate('LocationSelection', { role, name: route.params.name, subject, area, format });
      } else {
        navigation.navigate('FrequencySelection', { role, name: route.params.name, subject, area, format });
      }
    } else {
      Alert.alert('Error', 'Please select a teaching format');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.title}>Select Teaching Format</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, format === 'online' && styles.selectedButton]}
          onPress={() => setFormat('online')}
        >
          <Text style={[styles.buttonText, format === 'online' && styles.selectedButtonText]}>Online</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, format === 'face_to_face' && styles.selectedButton]}
          onPress={() => setFormat('face_to_face')}
        >
          <Text style={[styles.buttonText, format === 'face_to_face' && styles.selectedButtonText]}>Face to Face</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, format === 'hybrid' && styles.selectedButton]}
          onPress={() => setFormat('hybrid')}
        >
          <Text style={[styles.buttonText, format === 'hybrid' && styles.selectedButtonText]}>Hybrid</Text>
        </TouchableOpacity>
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

export default FormatSelectionScreen;