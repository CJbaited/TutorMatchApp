import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import OnboardingProgress from '../components/OnboardingProgress';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';

type RegistrationCompleteScreenRouteProp = RouteProp<RootStackParamList, 'RegistrationComplete'>;

const RegistrationCompleteScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RegistrationCompleteScreenRouteProp>();
  const { role } = route.params;

  const handleGetStarted = () => {
    if (role === 'student') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TutorDashboard' }],
      });
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <OnboardingProgress currentStep={8} totalSteps={8} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <LottieView
            source={require('../assets/success-animation.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
          
          <Text style={styles.title}>You're All Set!</Text>
          
          <Text style={styles.subtitle}>
            {role === 'student' 
              ? "Your profile is complete! You can now start searching for the perfect tutor to match your learning needs."
              : "Your tutor profile is now live! Students can discover you based on your subject expertise and availability."}
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="search" size={28} color="#084843" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>
                  {role === 'student' ? 'Find Tutors' : 'Be Discoverable'}
                </Text>
                <Text style={styles.featureDescription}>
                  {role === 'student' 
                    ? "Search for tutors based on subject, location, and availability"
                    : "Students can find you based on your expertise and teaching style"}
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={28} color="#084843" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Schedule Sessions</Text>
                <Text style={styles.featureDescription}>
                  {role === 'student' 
                    ? "Book sessions with tutors at times that work for you"
                    : "Manage your availability and accept bookings from students"}
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles" size={28} color="#084843" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Direct Communication</Text>
                <Text style={styles.featureDescription}>
                  {role === 'student' 
                    ? "Connect directly with tutors through in-app messaging"
                    : "Chat with students to discuss their learning needs"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={handleGetStarted}
      >
        <Text style={styles.getStartedButtonText}>Get Started</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#084843',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  featureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#084843',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  getStartedButton: {
    backgroundColor: '#084843',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  getStartedButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegistrationCompleteScreen;