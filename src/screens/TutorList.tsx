import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  ActivityIndicator 
} from 'react-native';
import { ArrowLeft, Filter, SortDesc } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatSpecializations } from '../utils/formatSpecializations';
import SortFilterModal, { SortOption, Filters } from '../components/SortFilterModal';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 20;

type TutorListProps = {
  route: {
    params: {
      category: string;
      title: string;
      tutors: Array<{
        id: string;
        name: string;
        image: any;
        affiliation: string;
        specialization: string[];
        rating: number;
        reviews: number;
        price: number;
      }>;
    }
  };
  navigation: any;
};

const TutorList = ({ route, navigation }: TutorListProps) => {
  const { category, tutors: initialTutors } = route.params;
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  const [filters, setFilters] = useState<Filters>({
    price: 2000,
    distance: 5,
    isRemoteOnly: false
  });
  
  // Add new states for pagination
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [displayedTutors, setDisplayedTutors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Apply filters and initial load
  useEffect(() => {
    applyFiltersAndSort();
  }, []);

  const applyFiltersAndSort = () => {
    let result = [...initialTutors];

    // Apply price filter
    result = result.filter(tutor => tutor.price <= filters.price);

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'distance_asc':
        // Assuming tutors have a distance property
        result = result.filter(tutor => (tutor.distance || 0) <= filters.distance);
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'remote':
        result = result.filter(tutor => tutor.teaching_format === 'online');
        break;
    }

    setFilteredTutors(result);
    loadMoreTutors(result, 1); // Load first page
  };

  const loadMoreTutors = (tutors = filteredTutors, page = currentPage) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const newTutors = tutors.slice(start, end);

    if (newTutors.length > 0) {
      setDisplayedTutors(prev => page === 1 ? newTutors : [...prev, ...newTutors]);
      setCurrentPage(page);
      setHasMore(end < tutors.length);
    } else {
      setHasMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setIsLoading(true);
      setTimeout(() => {
        loadMoreTutors(filteredTutors, currentPage + 1);
        setIsLoading(false);
      }, 500);
    }
  };

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>No more tutors available</Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#084843" />
        </View>
      );
    }

    return null;
  };

  const categoryTitles = {
    'Recommended': 'Recommended',
    'New': 'New',
    'Popular': 'Popular',
    'Best Rated': 'Best Rated'
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {categoryTitles[category]}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.iconButton, { marginLeft: 54 }]}
            onPress={() => setShowModal(true)}
          >
            <SortDesc size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayedTutors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.tutorCard}
            onPress={() => navigation.navigate('TutorProfile', { tutor: item })}
            activeOpacity={0.7}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.image_url }}  // Changed from item.image
                style={styles.tutorImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.tutorInfo}>
              <Text style={styles.tutorName}>{item.name}</Text>
              <Text style={styles.tutorAffiliation}>{item.affiliation}</Text>
              <Text style={styles.tutorSpecialization}>
                {formatSpecializations(item.specialization)}
              </Text>
              <View style={styles.ratingPrice}>
                <Text style={styles.rating}>⭐ {item.rating} ({item.reviews})</Text>
                <Text style={styles.price}>${item.price}/hr</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />

      <SortFilterModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onApply={() => {
          applyFiltersAndSort();
          setShowModal(false);
        }}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filters={filters}
        setFilters={setFilters}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    minWidth: 90, // Ensures space for both buttons
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  tutorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
      },
    }),
  },
  imageContainer: {
    width: width * 0.3,
    height: width * (Platform.OS === 'ios' ? 0.41 : 0.3),  //0.36,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  tutorImage: {
    width: '100%',
    height: Platform.OS==='ios' ? '110%': '100%',
  },
  tutorInfo: {
    flex: 1,
    padding: 12,
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
  ratingPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#084843',
  },
  listContainer: {
    paddingVertical: 8,
  },
  loader: {
    padding: 16,
    alignItems: 'center',
  },
  endMessage: {
    padding: 16,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default TutorList;