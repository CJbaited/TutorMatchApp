import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, SafeAreaView, Platform, } from 'react-native';
import { MessageCircle, Calendar, Star, Heart } from 'lucide-react-native';
import { colors } from '../theme/Theme';
import { useChat } from '../contexts/ChatContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { formatSpecializations } from '../utils/formatSpecializations';
import  supabase  from '../services/supabase';
import { RouteProp } from '@react-navigation/native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.55;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TutorProfileScreenProps = {
  route: RouteProp<{
    params: {
      tutor: {
        id: string;
        user_id: string;
        name: string;
        image_url: string;
        affiliation: string;
        specialization: string[];
        rating: number;
        reviews: number;
        price: number;
      };
    };
  }, 'params'>;
};

const TutorProfileScreen = ({ route }: TutorProfileScreenProps) => {
  const { tutor } = route.params || {};
  const { addConversation } = useChat();
  const navigation = useNavigation<NavigationProp>();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  // Add null check
  const [isFav, setIsFav] = useState(() => tutor?.id ? isFavorite(tutor.id) : false);
  const scrollY = new Animated.Value(0);

  // Add null checks to all tutor property accesses
  if (!tutor) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Tutor not found</Text>
      </View>
    );
  }

  const handleFavoritePress = () => {
    if (isFav) {
      removeFavorite(tutor.id);
    } else {
      addFavorite(tutor);
    }
    setIsFav(!isFav);
  };

  const handleStartChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for existing conversation
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('student_id', user.id)
        .eq('tutor_id', tutor.user_id) // Use tutor.user_id instead of tutor.id
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let conversationId;
      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            student_id: user.id,
            tutor_id: tutor.user_id // Use tutor.user_id instead of tutor.id
          })
          .select()
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }

      // Navigate to chat
      navigation.navigate('Chat', {
        conversationId,
        participantId: tutor.user_id
      });
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleBooking = () => {
    navigation.navigate('BookingCalendar', {
      tutorId: tutor.id,
      tutorName: tutor.name,
      price: tutor.price
    });
  };

  const renderAvailability = () => {
    if (!tutor.availability) return null;

    const schedule = tutor.availability.weeklySchedule;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.availabilityGrid}>
          {days.map((day, index) => {
            const daySchedule = schedule[index];
            return (
              <View key={day} style={styles.daySchedule}>
                <Text style={styles.dayName}>{day}</Text>
                <Text style={[
                  styles.dayStatus,
                  { color: daySchedule.available ? '#4CAF50' : '#FF0000' }
                ]}>
                  {daySchedule.available ? 'Available' : 'Off'}
                </Text>
                {daySchedule.available && daySchedule.ranges?.map((range, i) => (
                  <Text key={i} style={styles.timeSlot}>
                    {range.start} - {range.end}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <Image 
          source={{ uri: tutor.image_url }}  // Changed from tutor.image
          style={styles.backgroundImage}
        />

        <View style={styles.mainContent}>
          <View style={styles.fixedInfoBar}>
            <View style={styles.ratingContainer}>
              <Star size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{tutor.rating}</Text>
              <Text style={styles.reviews}>({tutor.reviews} reviews)</Text>
            </View>
            <Text style={styles.priceText}>${tutor.price}/hr</Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
            >
            <Heart 
              size={24} 
              color={isFav ? '#FF6B6B' : '#666'} 
              fill={isFav ? '#FF6B6B' : 'none'}
              />
            </TouchableOpacity>
          </View>

          <Animated.ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
          >
            <View style={styles.scrollContent}>
              <Text style={styles.name}>{tutor.name}</Text>
              <Text style={styles.affiliation}>{tutor.affiliation}</Text>
              <Text style={styles.specialization}>
                {formatSpecializations(tutor.specialization, 'multiline')}
              </Text>
            
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>About</Text>                
                  <Text style={styles.sectionText}>
                    Experienced tutor specializing in {tutor.specialization}. 
                    Dedicated to helping students achieve their academic goals.
                  </Text>
              </View>
              
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Experience</Text>
                <Text style={styles.sectionText}>
                  • 5+ years of teaching experience{'\n'}
                  • Master's degree in {tutor.subject}{'\n'}
                  • Certified instructor
                </Text>
              </View>

              {/* Add more sections */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Teaching Style</Text>
                <Text style={styles.sectionText}>
                  Interactive and engaging approach focusing on practical applications.
                  Tailored learning experience based on student's needs and goals.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <Text style={styles.sectionText}>
                  • Outstanding Tutor Award 2023{'\n'}
                  • 100+ successful students{'\n'}
                  • Published educational content
                </Text>
              </View>

              {renderAvailability()}

              {/* Bottom padding for fixed buttons */}
              <View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />
            </View>
          </Animated.ScrollView>
        </View>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.chatButton} 
          onPress={handleStartChat}
        >
          <MessageCircle size={28} color="#084843" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Calendar size={28} color="#fff" />
          <Text style={styles.bookButtonText}>Book Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainWrapper: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  mainContent: {
    flex: 1,
    marginTop: IMAGE_HEIGHT * (Platform.OS === 'ios' ? 0.78 : 1),//0.78,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  fixedInfoBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFF',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  affiliation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
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
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        paddingBottom: 34,
      },
      android: {
        elevation: 8,
        paddingBottom: 16,
      },
    }),
  },
  chatButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookButton: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    backgroundColor: '#084843',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#084843',
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  availabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
  },
  daySchedule: {
    flex: 1,
    minWidth: '30%',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayStatus: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeSlot: {
    fontSize: 12,
    color: '#666',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TutorProfileScreen;
