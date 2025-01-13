import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const route = useRoute<HomeScreenRouteProp>();
  const { role } = route.params;

  return (
    <View style={styles.container}>
      {role === 'student' ? (
        <View>
          <Text style={styles.title}>Welcome, Student</Text>
          <Text style={styles.subtitle}>Here are your recommended tutors:</Text>
          {/* Add components to display tutors based on criteria */}
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Welcome, Tutor</Text>
          <Text style={styles.subtitle}>Here are your analytics and tools:</Text>
          {/* Add components to display analytics and tools */}
        </View>
      )}
    </View>
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
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
});

export default HomeScreen;