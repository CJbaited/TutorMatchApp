// filepath: /c:/Users/PC/Documents/TutorMatchApp/src/screens/SubjectSelectionScreen.tsx
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
import { subjects } from '../config/subjectsConfig';


type SubjectSelectionScreenRouteProp = RouteProp<RootStackParamList, 'SubjectSelection'>;

const SubjectSelectionScreen = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<SubjectSelectionScreenRouteProp>();
  const { role, name } = route.params;

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('name')
        .order('name', { ascending: true });

      if (error) throw error;

      const subjectNames = data.map(item => item.name);
      setSubjects(subjectNames);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prevSelected => {
      const isSelected = prevSelected.includes(subject);
      
      if (isSelected) {
        return prevSelected.filter(s => s !== subject);
      } else {
        return [...prevSelected, subject];
      }
    });
  };

  const handleNext = () => {
    if (selectedSubjects.length > 0) {
      navigation.navigate('AreaSelection', { 
        role, 
        name, 
        subject: selectedSubjects 
      });
    }
  };

  const renderSubjectItem = ({ item }: { item: string }) => {
    const isSelected = selectedSubjects.includes(item);
    
    return (
      <TouchableOpacity
        style={[styles.subjectItem, isSelected && styles.selectedSubjectItem]}
        onPress={() => toggleSubject(item)}
      >
        <Text style={[styles.subjectText, isSelected && styles.selectedSubjectText]}>
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
        <Text style={styles.loadingText}>Loading subjects...</Text>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <OnboardingProgress currentStep={3} totalSteps={8} />

      <View style={styles.header}>
        <Text style={styles.title}>Select Your Subjects</Text>
        <Text style={styles.subtitle}>
          Choose the subjects that you're interested in {role === 'student' ? 'learning' : 'teaching'}
        </Text>
      </View>

      <FlatList
        data={subjects}
        renderItem={renderSubjectItem}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        style={styles.subjectList}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={[styles.nextButton, selectedSubjects.length === 0 && styles.disabledButton]}
        onPress={handleNext}
        disabled={selectedSubjects.length === 0}
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
  subjectList: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingBottom: 100,
  },
  subjectItem: {
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
  selectedSubjectItem: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  subjectText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSubjectText: {
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

export default SubjectSelectionScreen;