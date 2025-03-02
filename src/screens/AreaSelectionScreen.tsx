import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import supabase from '../services/supabase';
import OnboardingProgress from '../components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';
import { subjectAreas } from '../config/subjectsConfig';


type AreaSelectionScreenRouteProp = RouteProp<RootStackParamList, 'AreaSelection'>;

const AreaSelectionScreen = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AreaSelectionScreenRouteProp>();
  const { role, name, subject } = route.params;

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('subject_areas')
        .select('name')
        .eq('subject_name', subject[0]) // Using first selected subject for now
        .order('name', { ascending: true });

      if (error) throw error;

      const areaNames = data.map(item => item.name);
      setAreas(areaNames);
    } catch (error) {
      console.error('Error fetching areas:', error);
      // Fallback to some default areas if API fails
      const subjectAreas = subjectAreas[subject[0]] || ['Beginner', 'Intermediate', 'Advanced'];
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedArea) {
      navigation.navigate('FormatSelection', { 
        role, 
        name, 
        subject, 
        area: selectedArea 
      });
    }
  };

  const renderAreaItem = ({ item }: { item: string }) => {
    const isSelected = selectedArea === item;
    
    return (
      <TouchableOpacity
        style={[styles.areaItem, isSelected && styles.selectedAreaItem]}
        onPress={() => setSelectedArea(item)}
      >
        <Text style={[styles.areaText, isSelected && styles.selectedAreaText]}>
          {item}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#084843" />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#084843" />
        <Text style={styles.loadingText}>Loading subject areas...</Text>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <OnboardingProgress currentStep={4} totalSteps={8} />

      <View style={styles.header}>
        <Text style={styles.title}>Select Subject Area</Text>
        <Text style={styles.subtitle}>
          What specific aspect of {subject[0]} are you interested in?
        </Text>
      </View>

      <FlatList
        data={areas}
        renderItem={renderAreaItem}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        style={styles.areaList}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={[styles.nextButton, !selectedArea && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selectedArea}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#084843',
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
  areaList: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingBottom: 100,
  },
  areaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedAreaItem: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  areaText: {
    fontSize: 16,
    color: '#333',
  },
  selectedAreaText: {
    color: '#084843',
    fontWeight: '500',
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

export default AreaSelectionScreen;