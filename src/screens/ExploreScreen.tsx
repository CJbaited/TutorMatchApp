import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Search, Book, Microscope, Languages, Calculator } from 'lucide-react-native';
import { colors, commonStyles } from '../theme/Theme';

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 1, name: 'Mathematics', icon: Calculator, color: '#4CAF50' },
    { id: 2, name: 'Sciences', icon: Microscope, color: '#2196F3' },
    { id: 3, name: 'Languages', icon: Languages, color: '#9C27B0' },
    { id: 4, name: 'Humanities', icon: Book, color: '#FF9800' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glassContainer}>
        {/* Search Header */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects or tutors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Categories Section */}
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: `${category.color}15` }]}
              >
                <category.icon size={32} color={category.color} />
                <Text style={[styles.categoryText, { color: category.color }]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trending Subjects */}
          <Text style={styles.sectionTitle}>Trending Subjects</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Python', 'IELTS', 'Calculus', 'Physics'].map((subject) => (
              <TouchableOpacity key={subject} style={styles.trendingCard}>
                <Text style={styles.trendingText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  trendingCard: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  trendingText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExploreScreen;