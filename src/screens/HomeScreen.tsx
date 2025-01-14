import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { RootStackParamList } from '../navigation/types';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const route = useRoute<HomeScreenRouteProp>();
  const { role } = route.params;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a network request to fetch user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <SkeletonPlaceholder>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
          <View style={styles.skeletonContent} />
          <View style={styles.skeletonContent} />
          <View style={styles.skeletonContent} />
        </View>
      </SkeletonPlaceholder>
    );
  }

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
  skeletonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonTitle: {
    width: 200,
    height: 30,
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonSubtitle: {
    width: 150,
    height: 20,
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonContent: {
    width: 300,
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
  },
});

export default HomeScreen;