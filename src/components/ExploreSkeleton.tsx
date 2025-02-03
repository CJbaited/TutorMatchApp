import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

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

export const ExploreSkeleton = () => (
  <View style={styles.container}>
    {/* Search Bar Skeleton */}
    <View style={styles.searchContainer}>
      <SkeletonLoader style={styles.searchBar} />
    </View>

    {/* Featured Tutors Section Skeleton */}
    <ScrollView>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLoader style={styles.sectionTitle} />
          <SkeletonLoader style={styles.seeAllButton} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((i) => (
            <TutorCardSkeleton key={i} />
          ))}
        </ScrollView>
      </View>

      {/* Categories Section Skeleton */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLoader style={styles.sectionTitle} />
          <SkeletonLoader style={styles.seeAllButton} />
        </View>
        <View style={styles.categoriesGrid}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} style={styles.categoryCard} />
          ))}
        </View>
      </View>

      {/* Trending Section Skeleton */}
      <View style={styles.section}>
        <SkeletonLoader style={styles.sectionTitle} />
        <View style={styles.trendingGrid}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonLoader key={i} style={styles.trendingCard} />
          ))}
        </View>
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    margin: 16,
  },
  searchBar: {
    height: 48,
    borderRadius: 12,
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
    width: 150,
    height: 24,
    borderRadius: 4,
  },
  seeAllButton: {
    width: 80,
    height: 32,
    borderRadius: 16,
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
    gap: 8,
  },
  tutorName: {
    height: 20,
    width: '70%',
    borderRadius: 4,
  },
  tutorAffiliation: {
    height: 16,
    width: '50%',
    borderRadius: 4,
  },
  tutorSpecialization: {
    height: 16,
    width: '60%',
    borderRadius: 4,
  },
  rating: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    height: 60,
    borderRadius: 12,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingCard: {
    width: 100,
    height: 36,
    borderRadius: 20,
  },
});