// filepath: /c:/Users/PC/Documents/TutorMatchApp/src/screens/ProfileSetupScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import supabase from '../services/supabase';

export function ProfileSetupScreen({ navigation }: { navigation: any }) {
  const [role, setRole] = useState('');
  const [subject, setSubject] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');

  const handleProfileSetup = async () => {
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
          location,
          availability,
        },
      ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Your Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Role (student/tutor)"
        value={role}
        onChangeText={setRole}
        placeholderTextColor="#aaa"
      />
      {role === 'student' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Area"
            value={area}
            onChangeText={setArea}
            placeholderTextColor="#aaa"
          />
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Availability"
        value={availability}
        onChangeText={setAvailability}
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity style={styles.button} onPress={handleProfileSetup}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  input: {
    width: '80%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 25,
    marginBottom: 20,
    backgroundColor: '#E8F5E9',
    color: '#333',
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileSetupScreen;