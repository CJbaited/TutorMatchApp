import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,  // Add this import
  SafeAreaView, // Add this import
  Platform, // Add this import
} from 'react-native';
import { MessageCircle, Calendar, Star, Heart } from 'lucide-react-native';
import { colors } from '../theme/Theme';
import { useChat } from '../context/ChatContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.55;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TutorProfileScreen = ({ route }) => {
  const { tutor } = route.params;
  const { addConversation, conversations } = useChat();
  const navigation = useNavigation<NavigationProp>();
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollY = new Animated.Value(0);

  const handleStartChat = () => {
    // Check if conversation already exists
    const existingConversation = conversations.find(
      conv => conv.participantId === tutor.id
    );

    if (existingConversation) {
      // If exists, navigate to existing chat
      navigation.navigate('Chat', {
        conversationId: existingConversation.id,
        participantId: tutor.id,
      });
    } else {
      // If not exists, create new conversation
      const conversation = {
        id: Date.now(),
        participantId: tutor.id,
        name: tutor.name,
        lastMessage: '',
        time: 'New',
        unread: 0,
        image: tutor.image,
      };
      
      addConversation(conversation);
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        participantId: tutor.id
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <Image 
          source={tutor.image} 
          style={styles.backgroundImage}
        />

        <View style={styles.mainContent}>
          {/* Fixed Info Bar */}
          <View style={styles.fixedInfoBar}>
            <View style={styles.ratingContainer}>
              <Star size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{tutor.rating}</Text>
            </View>
            <Text style={styles.priceText}>${tutor.price}/hr</Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Heart 
                size={24} 
                color={isFavorite ? '#FF6B6B' : '#666'} 
                fill={isFavorite ? '#FF6B6B' : 'none'}
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
              <Text style={styles.subject}>{tutor.subject}</Text>
            
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.sectionText}>
                  Experienced tutor specializing in {tutor.subject}. 
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

              {/* Bottom padding for fixed buttons */}
              <View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />
            </View>
          </Animated.ScrollView>
        </View>
      </View>

      {/* Top Layer - Fixed Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
          <MessageCircle size={28} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton}>
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
    marginTop: IMAGE_HEIGHT * 0.65,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subject: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  infoSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  bottomButtons: {
    position: 'absolute',
    height: 124,
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  chatButton: {
    width: 64,
    height: 64,
    borderRadius: 35,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
    color: '#333',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TutorProfileScreen;
