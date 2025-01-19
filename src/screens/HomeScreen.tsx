import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Platform, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SlidersHorizontal, Star } from 'lucide-react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import { RootStackParamList } from '../navigation/types';
import { commonStyles, colors } from '../theme/Theme';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home' | 'DevHome'>;

const HomeScreen = () => {
  const route = useRoute<HomeScreenRouteProp>();
  const { role } = route.params;
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('New');
  const [modalVisible, setModalVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [240, 70],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const buttonTranslateX = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -32], // Move left when scrolled
    extrapolate: 'clamp',
  });

  const buttonTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -53], // Move up when scrolled
    extrapolate: 'clamp',
  });

  const buttonScale = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [.9, .8],
    extrapolate: 'clamp',
  });
  const buttonSize = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });

  const buttonPosition = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

    // NEW animation for 3 buttons alignment
    const buttonsMarginLeft = scrollY.interpolate({
      inputRange: [0, 50],
      outputRange: ['0', '20'], // Change alignment
      extrapolate: 'clamp',
    });

  const dummyTutors = [
    { id: 1, name: 'John Doe', subject: 'Physics', rating: 4.5, price: 30, image: 'https://placeimg.com/100/100/people' },
    { id: 2, name: 'Jane Smith', subject: 'English', rating: 4.9, price: 40, image: 'https://placeimg.com/101/101/people' },
    { id: 3, name: 'David Chen', subject: 'Math', rating: 4.8, price: 35, image: 'https://placeimg.com/102/102/people' },
    { id: 4, name: 'Emily Johnson', subject: 'Chemistry', rating: 4.3, price: 28, image: 'https://placeimg.com/103/103/people' },
    { id: 5, name: 'Michael Lee', subject: 'History', rating: 4.6, price: 32, image: 'https://placeimg.com/105/105/people' },
    { id: 6, name: 'Sara Williams', subject: 'Biology', rating: 4.7, price: 37, image: 'https://placeimg.com/104/104/people' },
    { id: 7, name: 'Alex Brown', subject: 'Literature', rating: 4.2, price: 25, image: 'https://placeimg.com/106/106/people' },
    { id: 8, name: 'Lisa Miller', subject: 'Geography', rating: 4.8, price: 39, image: 'https://placeimg.com/107/107/people' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

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
        <View style={styles.container}>
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.skeletonContainer} />
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
    <SafeAreaView style={{ flex: 1, paddingTop: -4, paddingHorizontal: 20, backgroundColor: '#e0f7fa' }}>
      {/* Glass-like container */}
      <View style={[styles.glassContainer, { flex: 1 }]}>
        <Animated.View style={{ height: headerHeight, justifyContent: 'center', paddingHorizontal: 4, marginHorizontal: -10 }}>
          {/* Top top part: filter button */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', right: 10, top: 10 }}>
            <TouchableOpacity style={{ width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.secondary }} onPress={() => setModalVisible(true)}>
              <SlidersHorizontal size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {/* Top middle part: title and subtitle */}
          <Animated.View style={{ opacity: titleOpacity, marginTop: 60 , marginLeft: 10 }}>
            <Text style={styles.gradientTitle}>Welcome,</Text>
            <Text style={styles.gradientSubtitle}>Student</Text>
          </Animated.View>
          <Animated.View style={{ opacity: titleOpacity, marginBottom: 5, marginLeft: 10 }}>
            <Text style={{ fontSize: 14, color: colors.textPrimary, textAlign: 'left' }}>Here are your recommended tutors:</Text>
          </Animated.View>
          {/* Top bottom part: 3 filter buttons */}
          <Animated.View 
            style={{ 
              flexDirection: 'row',
              justifyContent: 'center',
              position: 'static',
              marginBottom: -10,
              //right: 70, // Space for filter button
              transform: [
                { translateX: buttonTranslateX },
                { translateY: buttonTranslateY },
                { scale: buttonScale }
              ],
              // Add this to control overall position
              top: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [200, 50], // Adjust these values to match header height
                extrapolate: 'clamp'
              })
            }}
          >
            <TouchableOpacity 
              style={[
                commonStyles.button, 
                filter === 'New' && { backgroundColor: colors.primary },
                { marginHorizontal: 2 } // Add spacing between buttons
              ]} 
              onPress={() => setFilter('New')}
            >
              <Text style={[commonStyles.buttonText, filter === 'New' && { color: colors.buttonText }]}>
                New
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                commonStyles.button, 
                filter === 'Popular' && { backgroundColor: colors.primary },
                { marginHorizontal: 2 } // Add spacing between buttons
              ]} 
              onPress={() => setFilter('Popular')}
            >
              <Text style={[commonStyles.buttonText, filter === 'Popular' && { color: colors.buttonText }]}>
                Popular
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                commonStyles.button, 
                filter === 'Best Rated' && { backgroundColor: colors.primary },
                { marginHorizontal: 2 } // Add spacing between buttons
              ]} 
              onPress={() => setFilter('Best Rated')}
            >
              <Text style={[commonStyles.buttonText, filter === 'Best Rated' && { color: colors.buttonText }]}>
                Best Rated
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        <ScrollView
          style={{ flex: 1, marginTop: 5 , marginHorizontal: -12 }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <Animated.View style={[commonStyles.teachersContainer, { opacity: fadeAnim }]}>
            {dummyTutors.map((tutor) => (
              <View key={tutor.id} style={[commonStyles.card, { width: '45%', margin: 4}]}>
                <Image
                  source={{ uri: tutor.image }}
                  style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
                />
                <Text style={commonStyles.cardTitle}>{tutor.name}</Text>
                <Text style={commonStyles.cardText}>{tutor.subject}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Star size={16} color={colors.primary} />
                  <Text style={commonStyles.cardText}> {tutor.rating}</Text>
                </View>
                <Text style={commonStyles.cardText}>${tutor.price}/hr</Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>

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
    </SafeAreaView>
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
    paddingTop: Platform.OS === 'ios' ? 80 : 20, // Adjust for dynamic island on iPhones
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
  glassContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    flex: 1,
    marginTop: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8, // For Android
  },
  gradientTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 5,
  },
  gradientSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 10,
  },
  titleContainer: {
    marginTop: 80,
    alignItems: 'flex-start',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default HomeScreen;