import React, { useState, useRef, useEffect } from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Platform, Dimensions, Pressable} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Bell, ChevronRight, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {HomeSkeleton, TutorCardSkeleton} from '../components/HomeSkeleton';
import DrawerMenu from '../components/DrawerMenu';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;
const smallCardWidth = width * 0.4;

// Add categories array before HomeScreen component
const categories = ['Recommended', 'New', 'Popular', 'Best Rated'];

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Recommended');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  // Simulate initial loading
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  // Simulate category change loading
  const handleCategoryChange = (category) => {
    setIsCategoryLoading(true);
    setActiveCategory(category);
    setTimeout(() => {
      setIsCategoryLoading(false);
    }, 1000);
  };

  // Add categorized tutors data
  const tutorsByCategory = {
    Recommended: {
      title: "Recommended Tutors",
      data: [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          image: require('../assets/pexels-anastasia-shuraeva-5704849.jpg'),
          affiliation: 'Harvard University',
          specialization: 'Mathematics',
          rating: 4.9,
          reviews: 128
        },
        // Add more recommended tutors...
      ]
    },
    New: {
      title: "New Tutors",
      data: [
        {
          id: '2',
          name: 'Dr. James Wilson',
          image: require('../assets/pexels-anastasia-shuraeva-5704849.jpg'),
          affiliation: 'Stanford University',
          specialization: 'Physics',
          rating: 4.7,
          reviews: 14
        },
        // Add more new tutors...
      ]
    },
    Popular: {
      title: "Most Popular Tutors",
      data: [
        {
          id: '3',
          name: 'Prof. Emma Davis',
          image: require('../assets/pexels-anastasia-shuraeva-5704849.jpg'),
          affiliation: 'MIT',
          specialization: 'Computer Science',
          rating: 4.8,
          reviews: 256
        },
        // Add more popular tutors...
      ]
    },
    'Best Rated': {
      title: "Top Rated Tutors",
      data: [
        {
          id: '4',
          name: 'Dr. Michael Chen',
          image: require('../assets/pexels-anastasia-shuraeva-5704849.jpg'),
          affiliation: 'Yale University',
          specialization: 'Chemistry',
          rating: 5.0,
          reviews: 89
        },
        // Add more best rated tutors...
      ]
    }
  };

  // Get active category data
  const activeCategoryData = tutorsByCategory[activeCategory];

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <DrawerMenu 
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setIsDrawerVisible(true)}
        >
          <Menu size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Tutors</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                activeCategory === category && styles.activeCategoryButton
              ]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === category && styles.activeCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tutors Section */}
        {isCategoryLoading ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{tutorsByCategory[activeCategory].title}</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((item) => (
                <TutorCardSkeleton key={item} />
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{activeCategoryData.title}</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('TutorsOfMonth', { category: activeCategory })}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredTutorsContainer}
            >
              {activeCategoryData.data.map((tutor) => (
                <Pressable
                  key={tutor.id}
                  style={styles.featuredTutorCard}
                  onPress={() => navigation.navigate('TutorProfile', { tutor })}
                >
                  <Image source={tutor.image} style={styles.featuredTutorImage} />
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
                </Pressable>
              ))}
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('TutorsOfMonth', { category: activeCategory })}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* All Tutors */}
        <View style={styles.sectionContainer}>
          <View style={styles.allTutorsInfoCard}>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Browse All Tutors</Text>
              <Text style={styles.infoCardDescription}>
                Find the perfect tutor from our extensive network of qualified professionals
              </Text>
              <TouchableOpacity 
                style={styles.infoCardButton}
                onPress={() => navigation.navigate('Explore')}
              >
                <Text style={styles.infoCardButtonText}>Explore</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA', // Changed to match container
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
  },
  scrollContent: {
    paddingBottom: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  activeCategoryButton: {
    backgroundColor: '#084843', // Updated accent color
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: '#FFF',
  },
  sectionContainer: {
    marginTop: 24,
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
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#084843', // Added background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#fff', // Changed to white
    marginRight: 4,
  },
  featuredTutorsContainer: {
    paddingRight: 16,
  },
  featuredTutorCard: {
    width: cardWidth,
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
  featuredTutorImage: {
    width: '100%',
    height: 200,
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
  viewAllButton: {
    width: 100,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  allTutorsInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoCardButton: {
    backgroundColor: '#084843',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  infoCardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;