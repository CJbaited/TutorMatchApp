import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text, Modal, Alert } from 'react-native';
import { format } from 'date-fns';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { BookingCard } from '../components/booking/BookingCard';
import { subscribeToBookings, unsubscribeFromBookings } from '../utils/bookingSubscription';
import supabase from '../services/supabase';
import { Booking, BookingStatus } from '../types/booking';
import { X, AlertCircle, Star } from 'lucide-react-native';
import { RatingModal } from '../components/booking/RatingModalProps';
import { useNavigation } from '@react-navigation/native';

interface BookingDetailModalProps {
  booking: Booking;
  visible: boolean;
  onClose: () => void;
  onRating: (bookingId: string, tutorId: string, rating: number) => Promise<void>;
}

const TABS: { label: string; status: BookingStatus[] }[] = [
  { label: 'Upcoming', status: ['pending', 'confirmed'] },
  { label: 'Active', status: ['in_progress'] },
  { label: 'Past', status: ['completed', 'cancelled'] }
];

const BookingsScreen = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Move fetchBookings outside useEffect so it can be used elsewhere
  const fetchBookings = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          tutor_id,
          date,
          time,
          status,
          price,
          payment_method,
          completion_code,
          student_rating,
          has_rated,
          tutors (
            name
          )
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchBookings();

    // Set up real-time subscription
    const subscription = subscribeToBookings(user.id, 'student', (updatedBooking) => {
      setBookings(prevBookings => {
        const index = prevBookings.findIndex(b => b.id === updatedBooking.id);
        if (index >= 0) {
          const newBookings = [...prevBookings];
          newBookings[index] = updatedBooking;
          return newBookings;
        }
        return [...prevBookings, updatedBooking];
      });
    });

    return () => {
      unsubscribeFromBookings();
    };
  }, [user]);

  const handleRating = async (bookingId: string, tutorId: string, rating: number) => {
    try {
      // First check if booking has already been rated
      const { data: bookingCheck } = await supabase
        .from('bookings')
        .select('has_rated')
        .eq('id', bookingId)
        .single();

      if (bookingCheck?.has_rated) {
        Alert.alert('Error', 'You have already rated this session');
        return;
      }

      // Update booking with rating
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          student_rating: rating,
          has_rated: true
        })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Get all tutor's ratings
      const { data: tutorBookings, error: ratingsError } = await supabase
        .from('bookings')
        .select('student_rating')
        .eq('tutor_id', tutorId)
        .not('student_rating', 'is', null);

      if (ratingsError) throw ratingsError;

      // Calculate new average rating
      const allRatings = tutorBookings.map(b => b.student_rating);
      const averageRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

      // Update tutor's average rating
      const { error: tutorError } = await supabase
        .from('tutors')
        .update({ rating: averageRating.toFixed(1) })
        .eq('id', tutorId);

      if (tutorError) throw tutorError;

      // Refresh bookings and show success message
      await fetchBookings();
      Alert.alert('Success', 'Thank you for your rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const filteredBookings = bookings.filter(booking => 
    TABS[activeTab].status.includes(booking.status)
  );

  if (authLoading || loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#084843" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab.label}
            style={[
              styles.tab,
              activeTab === index && styles.activeTab
            ]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[
              styles.tabText,
              activeTab === index && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={({ item }) => (
          <BookingCard 
            booking={item}
            onPress={() => setSelectedBooking(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={() => {/* Implement refresh logic */}}
      />

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          visible={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRating={handleRating}
        />
      )}
    </View>
  );
};

const BookingDetailModal = ({ booking, visible, onClose, onRating }: BookingDetailModalProps) => {
  const navigation = useNavigation();
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleViewTutor = async () => {
    try {
      // Fetch full tutor data
      const { data: tutorData, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('id', booking.tutor_id)
        .single();

      if (error) throw error;

      // Navigate to tutor profile with complete data
      navigation.navigate('TutorProfile', { 
        tutor: {
          id: tutorData.id,
          user_id: tutorData.user_id,
          name: tutorData.name,
          image_url: tutorData.image_url,
          affiliation: tutorData.affiliation,
          specialization: tutorData.specialization,
          rating: tutorData.rating,
          reviews: tutorData.reviews,
          price: tutorData.price,
        } 
      });
      
      onClose(); // Close the booking detail modal
    } catch (error) {
      console.error('Error fetching tutor data:', error);
      Alert.alert('Error', 'Could not load tutor profile');
    }
  };

  const handleRatingSubmit = async (rating: number) => {
    await onRating(booking.id, booking.tutor_id, rating);
    setShowRatingModal(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            {/* Tutor Section */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Tutor</Text>
              <Text style={styles.tutorName}>{booking.tutors?.name}</Text>
              <TouchableOpacity 
                style={styles.viewTutorButton}
                onPress={handleViewTutor}
              >
                <Text style={styles.viewTutorButtonText}>View Tutor Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Session Details Section */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Session Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(`2000-01-01 ${booking.time}`), 'h:mm a')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, styles[`status_${booking.status}`]]}>
                  <Text style={[styles.statusText, styles[`statusText_${booking.status}`]]}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Details Section */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.price}>${booking.price}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>
                  {booking.payment_method === 'card' ? 'Credit/Debit Card' : 'Cash'}
                </Text>
              </View>
            </View>

            {/* Completion Code Section (for in-progress sessions) */}
            {booking.status === 'in_progress' && booking.completion_code && (
              <View style={styles.completionCodeSection}>
                <Text style={styles.sectionTitle}>Session Completion</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>Your completion code:</Text>
                  <Text style={styles.completionCode}>{booking.completion_code}</Text>
                  <View style={styles.infoBox}>
                    <AlertCircle size={20} color="#084843" />
                    <Text style={styles.infoText}>
                      Share this code with your tutor when the session is complete
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Rating Button (for completed sessions) */}
            {booking.status === 'completed' && !booking.student_rating && (
              <TouchableOpacity 
                style={styles.rateButton}
                onPress={() => setShowRatingModal(true)}
              >
                <Star size={20} color="#FFD700" />
                <Text style={styles.rateButtonText}>Rate Tutor</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <RatingModal 
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#084843',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#084843',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  completionCodeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  completionCodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#084843',
    marginVertical: 10,
  },
  completionCodeHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  detailSection: {
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  completionCodeSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  codeDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: '#084843',
    letterSpacing: 4,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F3F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#084843',
    marginLeft: 8,
    flex: 1,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginTop: 12,
  },
  rateButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailsContainer: {
    gap: 24,
  },
  tutorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  viewTutorButton: {
    backgroundColor: '#084843',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  viewTutorButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  status_pending: {
    backgroundColor: '#FFF3CD',
  },
  status_confirmed: {
    backgroundColor: '#D4EDDA',
  },
  status_in_progress: {
    backgroundColor: '#FFF3E0',
  },
  status_completed: {
    backgroundColor: '#E8F5E9',
  },
  status_cancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusText_pending: {
    color: '#856404',
  },
  statusText_confirmed: {
    color: '#155724',
  },
  statusText_in_progress: {
    color: '#FF9800',
  },
  statusText_completed: {
    color: '#388E3C',
  },
  statusText_cancelled: {
    color: '#D32F2F',
  },
});

export default BookingsScreen;
