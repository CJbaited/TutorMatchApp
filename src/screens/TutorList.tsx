import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform 
} from 'react-native';
import { ArrowLeft, Filter, SortDesc } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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
        specialization: string;
        rating: number;
        reviews: number;
        price: number;
      }>;
    }
  };
  navigation: any;
};

const TutorList = ({ route, navigation }: TutorListProps) => {
  const { category, tutors } = route.params;
  
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
          <TouchableOpacity style={styles.iconButton}>
            <SortDesc size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { marginLeft: 8 }]}>
            <Filter size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tutors}
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
                source={item.image} 
                style={styles.tutorImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.tutorInfo}>
              <Text style={styles.tutorName}>{item.name}</Text>
              <Text style={styles.tutorAffiliation}>{item.affiliation}</Text>
              <Text style={styles.tutorSpecialization}>{item.specialization}</Text>
              <View style={styles.ratingPrice}>
                <Text style={styles.rating}>⭐ {item.rating} ({item.reviews})</Text>
                <Text style={styles.price}>${item.price}/hr</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
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
    height: width * (Platform.OS === 'ios' ? 0.36 : 0.3),  //0.36,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
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
});

export default TutorList;