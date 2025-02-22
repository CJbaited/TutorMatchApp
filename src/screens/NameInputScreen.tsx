import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from '../services/supabase';

const NameInputScreen = () => {
  const [name, setName] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { role } = route.params;

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
  
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
  
      if (existingProfile) {
        // If profile exists, update it instead
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: name.trim(),
            role,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
  
        if (updateError) throw updateError;
      } else {
        // If no profile exists, create new one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            user_id: user.id,
            name: name.trim(),
            role,
            created_at: new Date().toISOString()
          }]);
  
        if (insertError) throw insertError;
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
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.title}>What's your name?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 25,
    marginBottom: 20,
    backgroundColor: '#E8F5E9',
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NameInputScreen;