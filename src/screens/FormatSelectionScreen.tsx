import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import OnboardingProgress from '../components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';

type FormatSelectionScreenRouteProp = RouteProp<RootStackParamList, 'FormatSelection'>;

interface FormatOption {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const FormatSelectionScreen = () => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<FormatSelectionScreenRouteProp>();
  const { role, name, subject, area } = route.params;

  const formatOptions: FormatOption[] = [
    {
      id: 'online',
      title: 'Online',
      description: 'Learn through video calls and online platforms',
      icon: require('../assets/online-icon.png'),
    },
    {
      id: 'face_to_face',
      title: 'In-Person',
      description: 'Meet face-to-face at an agreed location',
      icon: require('../assets/inperson-icon.png'),
    },
    {
      id: 'hybrid',
      title: 'Hybrid',
      description: 'Flexible with either online or in-person sessions',
      icon: require('../assets/hybrid-icon.png'),
    }
  ];

  const handleNext = () => {
    if (selectedFormat) {
      navigation.navigate('LocationSelection', { 
        role, 
        name, 
        subject, 
        area, 
        format: selectedFormat 
      });
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <OnboardingProgress currentStep={5} totalSteps={8} />

      <View style={styles.header}>
        <Text style={styles.title}>How Would You Like to Meet?</Text>
        <Text style={styles.subtitle}>
          Select your preferred teaching/learning format
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formatsContainer}>
          {formatOptions.map((format) => (
            <TouchableOpacity
              key={format.id}
              style={[
                styles.formatCard,
                selectedFormat === format.id && styles.selectedFormatCard
              ]}
              onPress={() => setSelectedFormat(format.id)}
            >
              <Image source={format.icon} style={styles.formatIcon} resizeMode="contain" />
              <View style={styles.formatTextContainer}>
                <Text style={styles.formatTitle}>{format.title}</Text>
                <Text style={styles.formatDescription}>{format.description}</Text>
              </View>
              {selectedFormat === format.id && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#084843" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.nextButton, !selectedFormat && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selectedFormat}
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
  },
  formatsContainer: {
    marginBottom: 80,
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedFormatCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  formatIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  formatTextContainer: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#084843',
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 14,
    color: '#666',
  },
  checkmarkContainer: {
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
});

export default FormatSelectionScreen;