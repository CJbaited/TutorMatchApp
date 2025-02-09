import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight, Star, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { formatSpecializations } from '../utils/formatSpecializations';
import { ExploreSkeleton } from '../components/ExploreSkeleton';
import debounce from 'lodash/debounce';
import supabase from '../services/supabase';

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [allTutors, setAllTutors] = useState([]);
  const [topTutors, setTopTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const categories = [
    { id: 1, name: 'English', color: '#084843' },
    { id: 2, name: 'Mathematics', color: '#084843' },
    { id: 3, name: 'Chinese Language', color: '#084843' },
    { id: 4, name: 'Test Preparation', color: '#084843' },
  ];

  const trendingSubjects = [
    'TOEIC',
    'Algebra',
    'Composition',
    'Physics',
    'IELTS',
    'Chemistry',
    'TOEFL',
  ];

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
  
    setIsSearching(true);
    setIsSearchLoading(true);
  
    try {
      const lowerQuery = query.toLowerCase();
  
      const { data: tutors, error } = await supabase
        .from('tutors')
        .select('*')
        .not('specialization', 'is', null); // Ensure specialization exists
  
      if (error) throw error;
  
      const filtered = tutors?.filter(tutor => {
        // Search by tutor name if it exists
        const nameMatch = tutor.name?.toLowerCase().includes(lowerQuery) || false;
        
        // Search by specialization (subjects) if it exists
        const subjectMatch = Array.isArray(tutor.specialization) && 
          tutor.specialization.some(
            subject => subject?.toLowerCase().includes(lowerQuery)
          );
  
        // Search by subject areas if they exist
        const areaMatch = Array.isArray(tutor.subject_areas) && 
          tutor.subject_areas.some(
            area => area?.toLowerCase().includes(lowerQuery)
          );
  
        return nameMatch || subjectMatch || areaMatch;
      });
  
      setSearchResults(filtered || []);
    } catch (error) {
      console.error('Error searching tutors:', error);
      setSearchResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };
  
  // Create debounced search
  const debouncedSearch = debounce(handleSearch, 500);
  
  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);
  
  const fetchTutors = async () => {
    try {
      const { data: tutors, error } = await supabase
        .from('tutors')
        .select('*')
        .order('rating', { ascending: false })
        .order('reviews', { ascending: false });

      if (error) throw error;

      setAllTutors(tutors || []);
      setTopTutors((tutors || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleCategoryPress = async (category: string) => {
    try {
      const { data: tutors, error } = await supabase
        .from('tutors')
        .select('*')
        .contains('specialization', [category])
        .order('rating', { ascending: false });

      if (error) throw error;

      navigation.navigate('TutorList', {
        category: category,
        title: `${category} Tutors`,
        tutors: tutors || []
      });
    } catch (error) {
      console.error('Error fetching tutors by category:', error);
    }
  };

  const handleTrendingPress = async (subject: string) => {
    try {
      const { data: tutors, error } = await supabase
        .from('tutors')
        .select('*')
        .contains('subject_areas', [subject])
        .order('rating', { ascending: false });

      if (error) throw error;

      navigation.navigate('TutorList', {
        category: subject,
        title: `${subject} Tutors`,
        tutors: tutors || []
      });
    } catch (error) {
      console.error('Error fetching tutors by subject area:', error);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  if (isLoading) {
    return <ExploreSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tutors, subjects or areas..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            debouncedSearch(text);
          }}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={clearSearch}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isSearching ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isSearchLoading ? 'Searching...' : 'Search Results'}
            </Text>
            {isSearchLoading ? (
              <ActivityIndicator color="#084843" style={styles.loader} />
            ) : (
              <View style={styles.searchResults}>
                {searchResults.length > 0 ? (
                  searchResults.map(tutor => (
                    <TouchableOpacity
                      key={tutor.id}
                      style={[styles.tutorCard, styles.searchTutorCard]}
                      onPress={() => navigation.navigate('TutorProfile', { tutor })}
                    >
                      <Image 
                        source={{ uri: tutor.image_url }} 
                        style={styles.searchTutorImage} 
                      />
                      <View style={styles.tutorInfo}>
                        <Text style={styles.tutorName}>{tutor.name}</Text>
                        <Text style={styles.tutorAffiliation}>
                          {tutor.affiliation}
                        </Text>
                        <Text style={styles.tutorSpecialization}>
                          {formatSpecializations(tutor.specialization)}
                        </Text>
                        <View style={styles.ratingContainer}>
                          <Star size={16} color="#FFD700" />
                          <Text style={styles.rating}>{tutor.rating}</Text>
                          <Text style={styles.reviews}>
                            ({tutor.reviews} reviews)
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noResults}>No tutors found</Text>
                )}
              </View>
            )}
          </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured Tutors Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tutors of the Month</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('TutorList', { 
                category: 'Featured',
                title: 'All Tutors',
                tutors: allTutors
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
            {topTutors.map(tutor => (
              <TouchableOpacity
                key={tutor.id}
                style={styles.tutorCard}
                onPress={() => navigation.navigate('TutorProfile', { tutor })}
              >
                <Image 
                  source={{ uri: tutor.image_url }} 
                  style={styles.tutorImage} 
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
              </TouchableOpacity>
            ))}
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
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.name)}
              >
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Area's</Text>
          <View style={styles.trendingGrid}>
            {trendingSubjects.map((subject, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.trendingCard}
                onPress={() => handleTrendingPress(subject)}
              >
                <Text style={styles.trendingText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
            </ScrollView>
          </>
        )}
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
  searchResults: {
    gap: 16,
  },
  searchTutorCard: {
    width: '100%',
    flexDirection: 'row',
    height: Platform.OS==='ios' ? 'auto': 'auto',
  },
  searchTutorImage: {
    width: 100,
    height: 'auto',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  loader: {
    marginTop: 20,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default ExploreScreen;