import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const ExploreScreen = () => {
  const navigation = useNavigation();
  
  const featuredTutors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      image: require('../assets/pexels-anastasia-shuraeva-5704849.jpg'),
      affiliation: 'Harvard University',
      specialization: 'Mathematics',
      rating: 4.9,
      reviews: 128,
      price: 75
    },
    // Add more featured tutors...
  ];

  const categories = [
    { id: 1, name: 'English', color: '#084843' },
    { id: 2, name: 'Math', color: '#084843' },
    { id: 3, name: 'Chinese', color: '#084843' },
    { id: 4, name: 'General Science', color: '#084843' },
  ];

  const trendingSubjects = [
    'Elementary English',
    'College Algebra',
    'Business Chinese',
    'Physics',
    'IELTS Preparation',
    'Chemistry',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subjects or tutors..."
          placeholderTextColor="#666"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured Tutors Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tutors of the Month</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('TutorList', { 
                category: 'Featured',
                tutors: featuredTutors
              })}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tutorsContainer}
          >
            {featuredTutors.map(tutor => (
              <TouchableOpacity
                key={tutor.id}
                style={styles.tutorCard}
                onPress={() => navigation.navigate('TutorProfile', { tutor })}
              >
                <Image source={tutor.image} style={styles.tutorImage} />
                <View style={styles.tutorInfo}>
                  <Text style={styles.tutorName}>{tutor.name}</Text>
                  <Text style={styles.tutorAffiliation}>{tutor.affiliation}</Text>
                  <Text style={styles.tutorSpecialization}>{tutor.specialization}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFD700" />
                    <Text style={styles.rating}>{tutor.rating}</Text>
                    <Text style={styles.reviews}>({tutor.reviews} reviews)</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('TutorList', { 
                category: 'Featured',
                tutors: featuredTutors
              })}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <Text style={styles.seeAllText}>See More</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
              >
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Subjects</Text>
          <View style={styles.trendingGrid}>
            {trendingSubjects.map((subject, index) => (
              <TouchableOpacity key={index} style={styles.trendingCard}>
                <Text style={styles.trendingText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 34,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#084843',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#fff',
    marginRight: 4,
  },
  tutorCard: {
    width: 280,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tutorImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tutorInfo: {
    padding: 16,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tutorAffiliation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tutorSpecialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
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
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#084843',
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingCard: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#084843',
  },
  trendingText: {
    color: '#084843',
    fontSize: 14,
    fontWeight: '500',
  },
  tutorsContainer: {
    paddingRight: 16,
  },
  viewAllButton: {
    width: 100,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
});

export default ExploreScreen;