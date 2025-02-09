// filepath: /c:/Users/PC/Documents/TutorMatchApp/src/screens/SubjectSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import 'tailwindcss/tailwind.css';

const subjects = ['English', 'Math', 'Biology', 'Physics', 'Chemistry', 'Other'];

const SubjectSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { role } = route.params as { role: string };

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleNext = () => {
    if (selectedSubjects.length > 0) {
      navigation.navigate('AreaSelection', { role, name: route.params.name, subject: selectedSubjects });
    } else {
      Alert.alert('Error', 'Please select at least one subject');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.title}>Select Your Subjects</Text>
      <View style={styles.subjectContainer}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.subjectButton,
              selectedSubjects.includes(subject) && styles.selectedSubjectButton,
            ]}
            onPress={() => handleSubjectToggle(subject)}
          >
            <Text
              style={[
                styles.subjectButtonText,
                selectedSubjects.includes(subject) && styles.selectedSubjectButtonText,
              ]}
            >
              {subject}
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
  subjectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  subjectButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  selectedSubjectButton: {
    backgroundColor: '#4CAF50',
  },
  subjectButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedSubjectButtonText: {
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

export default SubjectSelectionScreen;