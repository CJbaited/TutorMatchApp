import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Star, Heart } from 'lucide-react-native';
import { colors, commonStyles } from '../theme/Theme';

const FavoritesScreen = () => {
  const favoriteTutors = [
    { id: 1, name: 'John Doe', subject: 'Physics', rating: 4.5, price: 30, image: require('../assets/pexels-a-darmel-7322232.jpg') },
    { id: 2, name: 'Jane Smith', subject: 'English', rating: 4.9, price: 40, image: require('../assets/pexels-anastasia-shuraeva-5704849.jpg') },
    // ...existing code...
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glassContainer}>
        <Text style={styles.headerTitle}>My Favorite Tutors</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {favoriteTutors.map((tutor) => (
            <TouchableOpacity key={tutor.id} style={styles.tutorCard}>
              <Image source={tutor.image} style={styles.tutorImage} />
              <View style={styles.tutorInfo}>
                <Text style={styles.tutorName}>{tutor.name}</Text>
                <Text style={styles.tutorSubject}>{tutor.subject}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color={colors.primary} />
                  <Text style={styles.ratingText}>{tutor.rating}</Text>
                </View>
                <Text style={styles.priceText}>${tutor.price}/hr</Text>
              </View>
              <TouchableOpacity style={styles.favoriteButton}>
                <Heart size={24} color={colors.primary} fill={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  glassContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    flex: 1,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  tutorCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tutorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  tutorInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  tutorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  tutorSubject: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: colors.textPrimary,
  },
  priceText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  favoriteButton: {
    padding: 10,
  },
});

export default FavoritesScreen;