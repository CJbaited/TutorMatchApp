import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Star, Heart } from 'lucide-react-native';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigation } from '@react-navigation/native';
import { formatSpecializations } from '../utils/formatSpecializations';

const FavoritesScreen = () => {
  const { favorites, removeFavorite } = useFavorites();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorite Tutors</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No favorite tutors yet</Text>
          </View>
        )}
        renderItem={({ item: tutor }) => (
          <TouchableOpacity 
            style={styles.tutorCard}
            onPress={() => navigation.navigate('TutorProfile', { tutor })}
            activeOpacity={0.7}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: tutor.image_url }}  // Changed from tutor.image
                style={styles.tutorImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.tutorInfo}>
              <Text style={styles.tutorName}>{tutor.name}</Text>
              <Text style={styles.tutorAffiliation}>{tutor.affiliation}</Text>
              <Text style={styles.tutorSpecialization}>
                {formatSpecializations(tutor.specialization)}
              </Text>
              <View style={styles.ratingPrice}>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFD700" />
                  <Text style={styles.rating}>{tutor.rating}</Text>
                  <Text style={styles.reviews}>({tutor.reviews})</Text>
                </View>
                <Text style={styles.price}>${tutor.price}/hr</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => removeFavorite(tutor.id)}
            >
              <Heart size={24} color="#084843" fill="#084843" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS==='ios' ? 64: 42,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  tutorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
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
      },
    }),
  },
  imageContainer: {
    width: Platform.OS==='ios' ? 84: 100,
    height: Platform.OS==='ios' ? 116: 124,
    backgroundColor: '#F0F0F0',
  },
  tutorImage: {
    width: '100%',
    height: '100%',
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
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#084843',
  },
  favoriteButton: {
    padding: 12,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});

export default FavoritesScreen;