import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import 'tailwindcss/tailwind.css';
import { RootStackParamList } from '../navigation/types';

const subjectToAreas = {
  English: ['Grammar', 'Literature', 'Writing', 'speaking'],
  Math: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
  Biology: ['Genetics', 'Ecology', 'Anatomy', 'Physiology'],
  Physics: ['Mechanics', 'Optics', 'Thermodynamics'],
  Chemistry: ['Organic', 'Inorganic', 'Physical'],
  Other: ['General Studies', 'Special Topics'],
};

type AreaSelectionScreenRouteProp = RouteProp<RootStackParamList, 'AreaSelection'>;

const AreaSelectionScreen = () => {
  const [area, setArea] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AreaSelectionScreenRouteProp>();
  const { role, subject } = route.params;

  useEffect(() => {
    const selectedAreas = subject.flatMap((sub) => subjectToAreas[sub] || []);
    setItems(selectedAreas.map((area) => ({ label: area, value: area })));
  }, [subject]);

  const handleNext = () => {
    if (area) {
      navigation.navigate('FormatSelection', { role, subject, area });
    } else {
      Alert.alert('Error', 'Please select an area');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.title}>Select Your Area</Text>
      <DropDownPicker
        open={open}
        value={area}
        items={items}
        setOpen={setOpen}
        setValue={setArea}
        setItems={setItems}
        containerStyle={{ width: '80%', marginBottom: 20 }}
        style={{ borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
        dropDownContainerStyle={{ backgroundColor: '#E8F5E9' }}
      />
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

export default AreaSelectionScreen;