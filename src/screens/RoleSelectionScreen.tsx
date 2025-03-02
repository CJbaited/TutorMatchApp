import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import OnboardingProgress from '../components/OnboardingProgress';
import 'tailwindcss/tailwind.css';
import supabase from '../services/supabase';

const RoleSelectionScreen = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleNext = () => {
    if (selectedRole) {
      navigation.navigate('NameInput', { role: selectedRole });
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <OnboardingProgress currentStep={1} totalSteps={8} />

      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Are you looking to learn or to teach? Select your role to get started.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'student' && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole('student')}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../assets/student-icon.png')} 
            style={styles.roleIcon}
            resizeMode="contain"
          />
          <Text style={styles.roleTitle}>Student</Text>
          <Text style={styles.roleDescription}>
            I'm looking for a tutor to help me learn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'tutor' && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole('tutor')}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../assets/tutor-icon.png')} 
            style={styles.roleIcon} 
            resizeMode="contain"
          />
          <Text style={styles.roleTitle}>Tutor</Text>
          <Text style={styles.roleDescription}>
            I want to offer my teaching services
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !selectedRole && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selectedRole}
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 10,
  },
  cardsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    gap: 20,
    marginVertical: 20,
  },
  roleCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  selectedCard: {
    borderColor: '#084843',
    backgroundColor: '#E8F5E9',
  },
  roleIcon: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#084843',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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

export default RoleSelectionScreen;