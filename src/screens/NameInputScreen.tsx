import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import supabase from '../services/supabase';
import OnboardingProgress from '../components/OnboardingProgress';

type NameInputScreenRouteProp = RouteProp<RootStackParamList, 'NameInput'>;

const NameInputScreen = () => {
  const [name, setName] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<NameInputScreenRouteProp>();
  const { role } = route.params;

  const handleNext = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter your full name');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Only create/update profile for students
      if (role === 'student') {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existingProfile) {
          // If profile exists, update it
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              name: name.trim(),
              role: 'student',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
      
          if (updateError) throw updateError;
        } else {
          // If no profile exists, create new one for student only
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              user_id: user.id,
              name: name.trim(),
              role: 'student',
              created_at: new Date().toISOString()
            }]);
      
          if (insertError) throw insertError;
        }
      }

      // Continue with navigation
      navigation.navigate('SubjectSelection', { 
        role,
        name: name.trim()
      });
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animatable.View animation="fadeIn" style={styles.contentContainer}>
          <OnboardingProgress currentStep={2} totalSteps={8} />

          <View style={styles.header}>
            <Text style={styles.title}>What's Your Name?</Text>
            <Text style={styles.subtitle}>
              Please enter your full name as you'd like it to appear on your profile
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.nextButton, !name.trim() && styles.disabledButton]}
            onPress={handleNext}
            disabled={!name.trim()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </Animatable.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
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
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#084843',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
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

export default NameInputScreen;