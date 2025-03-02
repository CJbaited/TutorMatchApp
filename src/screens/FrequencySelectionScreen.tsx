import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import OnboardingProgress from '../components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

type FrequencySelectionScreenRouteProp = RouteProp<RootStackParamList, 'FrequencySelection'>;

const frequencies = [
  { label: '1x per week', value: '1' },
  { label: '2x per week', value: '2' },
  { label: '3x per week', value: '3' },
  { label: '4x per week', value: '4' },
  { label: 'Once every 2 weeks', value: '0.5' },
  { label: 'Once every 3 weeks', value: '0.33' },
  { label: 'Once per month', value: '0.25' },
];

const FrequencySelectionScreen = () => {
  const [frequency, setFrequency] = useState('1');
  const [isFlexible, setIsFlexible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<FrequencySelectionScreenRouteProp>();
  const { role, name, subject, area, format, location } = route.params;

  const handleNext = () => {
    navigation.navigate('DurationSelection', { 
      role, 
      name, 
      subject, 
      area, 
      format, 
      location, 
      latitude: route.params.latitude || null,
      longitude: route.params.longitude || null, 
      frequency: isFlexible ? 'flexible' : frequency 
    });
  };

  const getFrequencyLabel = () => {
    if (isFlexible) return 'Flexible';
    const selectedFreq = frequencies.find(f => f.value === frequency);
    return selectedFreq ? selectedFreq.label : '1x per week';
  };

  const getSliderValue = () => {
    const index = frequencies.findIndex(f => f.value === frequency);
    return index >= 0 ? index : 0;
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <OnboardingProgress currentStep={6} totalSteps={8} />

      <View style={styles.header}>
        <Text style={styles.title}>How Often?</Text>
        <Text style={styles.subtitle}>
          Select how frequently you'd like to {role === 'student' ? 'learn' : 'teach'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.frequencyContainer}>
          <Image 
            source={require('../assets/calendar-icon.png')} 
            style={styles.calendarIcon}
            resizeMode="contain"
          />
          
          <View style={styles.sliderContainer}>
            <Text style={styles.frequencyLabel}>{getFrequencyLabel()}</Text>
            
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={frequencies.length - 1}
              step={1}
              value={isFlexible ? 0 : getSliderValue()}
              onValueChange={(value) => {
                setIsFlexible(false);
                setFrequency(frequencies[value].value);
              }}
              minimumTrackTintColor="#084843"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#084843"
              disabled={isFlexible}
            />
            
            <View style={styles.sliderLabelsContainer}>
              <Text style={styles.sliderLabel}>Less frequent</Text>
              <Text style={styles.sliderLabel}>More frequent</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.flexibleButton, isFlexible && styles.selectedFlexibleButton]}
            onPress={() => setIsFlexible(!isFlexible)}
          >
            <Text style={[styles.flexibleButtonText, isFlexible && styles.selectedFlexibleButtonText]}>
              I'm flexible with timing
            </Text>
            {isFlexible && (
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
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
  frequencyContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  calendarIcon: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 30,
  },
  frequencyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#084843',
    textAlign: 'center',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
  },
  flexibleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedFlexibleButton: {
    backgroundColor: '#084843',
    borderColor: '#084843',
  },
  flexibleButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginRight: 10,
  },
  selectedFlexibleButtonText: {
    color: '#FFF',
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
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FrequencySelectionScreen;