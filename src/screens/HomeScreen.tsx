import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import DropDownPicker from 'react-native-dropdown-picker';
import { RootStackParamList } from '../navigation/types';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home' | 'DevHome'>;

const HomeScreen = () => {
  const route = useRoute<HomeScreenRouteProp>();
  const { role } = route.params;
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('New');
  const [modalVisible, setModalVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState({});

  useEffect(() => {
    // Simulate a network request to fetch user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const handleConfirmFilter = () => {
    setModalVisible(false);
    setLoading(true);
    // Simulate a network request to fetch filtered data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  };

  const toggleDropdown = (category) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (loading) {
    return (
      <SkeletonPlaceholder>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
          <View style={styles.skeletonContent} />
          <View style={styles.skeletonContent} />
          <View style={styles.skeletonContent} />
        </View>
      </SkeletonPlaceholder>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.circleButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <View style={styles.topContainer}>
        <Text style={styles.title}>Welcome,</Text>
        <Text style={styles.name}>Student</Text>
      </View>
      <Text style={styles.subtitle}>Here are your recommended tutors:</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'New' && styles.selectedButton]}
          onPress={() => setFilter('New')}
        >
          <Text style={[styles.filterButtonText, filter === 'New' && styles.selectedButtonText]}>New</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'Popular' && styles.selectedButton]}
          onPress={() => setFilter('Popular')}
        >
          <Text style={[styles.filterButtonText, filter === 'Popular' && styles.selectedButtonText]}>Popular</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'Best Rated' && styles.selectedButton]}
          onPress={() => setFilter('Best Rated')}
        >
          <Text style={[styles.filterButtonText, filter === 'Best Rated' && styles.selectedButtonText]}>Best Rated</Text>
        </TouchableOpacity>
      </View>

      {/* Add components to display tutors based on criteria and filter */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
              <View style={styles.filtersContainer}>
                <Text style={styles.filterTitle}>Subject</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {['Math', 'Science', 'English'].map((subject) => (
                    <TouchableOpacity key={subject} style={styles.filterButton}>
                      <Text style={styles.filterButtonText}>{subject}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.filterTitle}>Area</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {['Algebra', 'Geometry', 'Literature'].length > 5 ? (
                    <DropDownPicker
                      open={openDropdown['Area']}
                      value={null}
                      items={['Algebra', 'Geometry', 'Literature'].map((area) => ({ label: area, value: area }))}
                      setOpen={() => toggleDropdown('Area')}
                      setValue={() => {}}
                      setItems={() => {}}
                      containerStyle={{ width: '100%' }}
                      style={{ borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
                      dropDownContainerStyle={{ backgroundColor: '#E8F5E9' }}
                    />
                  ) : (
                    ['Algebra', 'Geometry', 'Literature'].map((area) => (
                      <TouchableOpacity key={area} style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>{area}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
                <Text style={styles.filterTitle}>Location</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {['Taipei', 'Taichung', 'Kaohsiung'].length > 5 ? (
                    <DropDownPicker
                      open={openDropdown['Location']}
                      value={null}
                      items={['Taipei', 'Taichung', 'Kaohsiung'].map((location) => ({ label: location, value: location }))}
                      setOpen={() => toggleDropdown('Location')}
                      setValue={() => {}}
                      setItems={() => {}}
                      containerStyle={{ width: '100%' }}
                      style={{ borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
                      dropDownContainerStyle={{ backgroundColor: '#E8F5E9' }}
                    />
                  ) : (
                    ['Taipei', 'Taichung', 'Kaohsiung'].map((location) => (
                      <TouchableOpacity key={location} style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>{location}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
                <Text style={styles.filterTitle}>Format</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {['Online', 'Face to Face', 'Hybrid'].map((format) => (
                    <TouchableOpacity key={format} style={styles.filterButton}>
                      <Text style={styles.filterButtonText}>{format}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.filterTitle}>Frequency</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {['1x a week', '2x a week', '3x a week'].map((frequency) => (
                    <TouchableOpacity key={frequency} style={styles.filterButton}>
                      <Text style={styles.filterButtonText}>{frequency}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.filterTitle}>Duration</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {['30 minutes', '1 hour', '1.5 hours'].map((duration) => (
                    <TouchableOpacity key={duration} style={styles.filterButton}>
                      <Text style={styles.filterButtonText}>{duration}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmFilter}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust for dynamic island on iPhones
    paddingHorizontal: 20,
  },
  topContainer: {
    alignItems: 'flex-start',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    textAlign: 'left',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 20,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingTop: Platform.OS === 'ios' ? 30 : 20, // Adjust for dynamic island on iPhones
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  filtersContainer: {
    width: '100%',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust for dynamic island on iPhones
  },
  horizontalScroll: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  confirmButton: {
    width: '95%',
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //paddingTop: Platform.OS === 'ios' ? 80 : 20, // Adjust for dynamic island on iPhones
  },
  skeletonTitle: {
    width: 200,
    height: 30,
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonSubtitle: {
    width: 150,
    height: 20,
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonContent: {
    width: 300,
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
  },
});

export default HomeScreen;