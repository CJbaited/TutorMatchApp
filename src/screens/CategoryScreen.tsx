import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from '../services/supabase';
import { subjects } from '../config/subjectsConfig';


const CategoryScreen = () => {
  const navigation = useNavigation();

  const handleSubjectPress = async (subject: string) => {
    try {
      // Fetch tutors matching the selected subject
      const { data: tutors, error } = await supabase
        .from('tutors')
        .select('*')
        .contains('specialization', [subject])
        .order('rating', { ascending: false });

      if (error) throw error;

      navigation.navigate('TutorList', {
        category: subject,
        title: `${subject} Tutors`,
        tutors: tutors || []
      });
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle,{marginLeft:-46} ]}>Categories</Text>
        <View />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={styles.card}
              onPress={() => handleSubjectPress(subject)}
            >
              <Text style={styles.cardText}>{subject}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#084843',
  },
});

export default CategoryScreen;