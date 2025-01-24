import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

export const TutorCardSkeleton = () => (
  <View style={styles.tutorCard}>
    <SkeletonLoader style={styles.tutorImage} />
    <View style={styles.tutorInfo}>
      <SkeletonLoader style={styles.tutorName} />
      <SkeletonLoader style={styles.tutorAffiliation} />
      <SkeletonLoader style={styles.tutorSpecialization} />
      <SkeletonLoader style={styles.rating} />
    </View>
  </View>
);

export const HomeSkeleton = () => (
  <View style={styles.container}>
    {/* Header Skeleton */}
    <View style={styles.header}>
      <SkeletonLoader style={styles.menuIcon} />
      <SkeletonLoader style={styles.headerTitle} />
      <SkeletonLoader style={styles.bellIcon} />
    </View>

    {/* Categories Skeleton */}
    <View style={styles.categoriesContainer}>
      {[1, 2, 3, 4].map((item) => (
        <SkeletonLoader key={item} style={styles.categoryButton} />
      ))}
    </View>

    {/* Tutors Section Skeleton */}
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SkeletonLoader style={styles.sectionTitle} />
        <SkeletonLoader style={styles.seeAllButton} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tutorsContainer}
      >
        {[1, 2, 3].map((item) => (
          <TutorCardSkeleton key={item} />
        ))}
      </ScrollView>
    </View>

    {/* Info Card Skeleton */}
    <View style={styles.infoCard}>
      <SkeletonLoader style={styles.infoTitle} />
      <SkeletonLoader style={styles.infoDescription} />
      <SkeletonLoader style={styles.infoButton} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  headerTitle: {
    width: 120,
    height: 24,
  },
  bellIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  categoryButton: {
    width: 100,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    width: 150,
    height: 24,
  },
  seeAllButton: {
    width: 80,
    height: 32,
    borderRadius: 16,
  },
  tutorsContainer: {
    marginBottom: 24,
  },
  tutorCard: {
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
  tutorImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tutorInfo: {
    padding: 16,
  },
  tutorName: {
    height: 20,
    width: '80%',
    marginBottom: 8,
  },
  tutorAffiliation: {
    height: 16,
    width: '60%',
    marginBottom: 8,
  },
  tutorSpecialization: {
    height: 16,
    width: '40%',
    marginBottom: 8,
  },
  rating: {
    height: 16,
    width: '30%',
  },
  infoCard: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    margin: 16,
  },
  infoTitle: {
    height: 24,
    width: '60%',
    marginBottom: 12,
  },
  infoDescription: {
    height: 32,
    width: '90%',
    marginBottom: 16,
  },
  infoButton: {
    height: 40,
    width: 120,
    borderRadius: 20,
  },
});