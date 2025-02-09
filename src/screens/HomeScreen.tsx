import React, { useState, useRef, useEffect } from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Platform, Dimensions, Pressable} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Bell, ChevronRight, Star } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {HomeSkeleton, TutorCardSkeleton} from '../components/HomeSkeleton';
import DrawerMenu from '../components/DrawerMenu';
import  supabase  from '../services/supabase';
import { formatSpecializations } from '../utils/formatSpecializations';

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
  const [userPreferences, setUserPreferences] = useState<{
    subjects: string[];
    subject_areas: Record<string, string[]>;
  }>({
    subjects: [],
    subject_areas: {}
  });
  const [tutors, setTutors] = useState([]);
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchUserPreferences();
  }, []); // Initial fetch

  useEffect(() => {
    if (userPreferences.subjects) {
      fetchTutors(userPreferences.subjects, userPreferences.subject_areas);
    }
  }, [userPreferences]); // Refetch when preferences change

  useFocusEffect(
    React.useCallback(() => {
      fetchUserPreferences();
    }, [])
  );

  const fetchUserPreferences = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (!profile) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'RoleSelection' }]
        });
        return;
      }

      // Parse preferences data
      const subjects = profile.subjects 
        ? (Array.isArray(profile.subjects) 
            ? profile.subjects 
            : typeof profile.subjects === 'string'
              ? JSON.parse(profile.subjects)
              : [])
        : [];

      const subject_areas = profile.subject_areas
        ? (typeof profile.subject_areas === 'string'
            ? JSON.parse(profile.subject_areas)
            : profile.subject_areas)
        : {};

      setUserPreferences({
        subjects,
        subject_areas
      });

    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the fetchTutors function
  const fetchTutors = async (subjects: string[], subject_areas: Record<string, string[]>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
  
      // Get user profile including teaching format preference
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('latitude, longitude, preferred_radius, city, teaching_format')
        .eq('user_id', user.id)
        .single();
  
      const { data: allTutors, error } = await supabase
        .from('tutors')
        .select('*')
        .order('rating', { ascending: false });
  
      if (error) throw error;
  
      // Helper function to check teaching format compatibility
      const isTeachingFormatCompatible = (tutorFormat: string, userFormat: string) => {
        switch (userFormat) {
          case 'online':
            return tutorFormat === 'online' || tutorFormat === 'hybrid';
          case 'face_to_face':
            return tutorFormat === 'face_to_face' || tutorFormat === 'hybrid';
          case 'hybrid':
            return tutorFormat === 'hybrid' || tutorFormat === 'online' || tutorFormat === 'face_to_face';
          default:
            return true;
        }
      };
  
      // Filter tutors based on location, preferences, and teaching format
      const filteredTutors = allTutors.filter(tutor => {
        // Check teaching format compatibility
        const formatMatch = isTeachingFormatCompatible(tutor.teaching_format, userProfile.teaching_format);
        if (!formatMatch) return false;
  
        // If online teaching or user prefers online, don't filter by location
        if (tutor.teaching_format === 'online' || userProfile.teaching_format === 'online') {
          return subjects.some(subject => tutor.specialization.includes(subject));
        }
  
        // Calculate distance for face-to-face or hybrid formats
        const distance = calculateDistance(
          userProfile.latitude,
          userProfile.longitude,
          tutor.latitude,
          tutor.longitude
        );
  
        // Check if within preferred radius
        const withinRadius = distance <= userProfile.preferred_radius;
  
        // Check subject match
        const hasMatchingSubject = subjects.some(subject => 
          tutor.specialization.includes(subject)
        );
  
        // Check areas if subject matches
        if (!hasMatchingSubject) return false;
  
        const selectedAreas = subjects.reduce((areas, subject) => {
          return [...areas, ...(subject_areas[subject] || [])];
        }, []);
  
        // If no areas selected, return location check
        if (selectedAreas.length === 0) return withinRadius;
  
        // Check if tutor areas match user selected areas
        return selectedAreas.some(area => 
          tutor.subject_areas.includes(area)
        ) && withinRadius;
      });
  
      setTutors(filteredTutors);
  
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setTutors([]);
    }
  };
  
  // Haversine formula for calculating distance between coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };
  
  // Simulate category change loading
  const handleCategoryChange = (category) => {
    setIsCategoryLoading(true);
    setActiveCategory(category);
    setTimeout(() => {
      setIsCategoryLoading(false);
    }, 1000);
  };

  // Update tutorsByCategory to only show filtered tutors
  const tutorsByCategory = {
    Recommended: {
      title: "Recommended Tutors",
      data: tutors.filter(t => t.rating >= 4.5)
    },
    New: {
      title: "New Tutors",
      data: tutors
        .sort((a, b) => new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime())
        .slice(0, 5)
    },
    Popular: {
      title: "Most Popular Tutors",
      data: tutors.sort((a, b) => b.reviews - a.reviews).slice(0, 5)
    },
    'Best Rated': {
      title: "Top Rated Tutors",
      data: tutors.sort((a, b) => b.rating - a.rating).slice(0, 5)
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
                onPress={() => navigation.navigate('TutorList', { 
                  category: activeCategory,
                  tutors: activeCategoryData.data // Pass the category-specific tutors
                })}
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
                  <Image 
                    source={{ uri: tutor.image_url }}  // Changed from tutor.image
                    style={styles.featuredTutorImage} 
                  />
                  <View style={styles.tutorInfo}>
                    <Text style={styles.tutorName}>{tutor.name}</Text>
                    <Text style={styles.tutorAffiliation}>{tutor.affiliation}</Text>
                    <Text style={styles.tutorSpecialization}>
                      {formatSpecializations(tutor.specialization)}
                    </Text>
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
                onPress={() => navigation.navigate('TutorList', { 
                  category: activeCategory,
                  tutors: activeCategoryData.data
                })}
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