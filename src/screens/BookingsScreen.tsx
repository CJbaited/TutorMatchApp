import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text, Modal, Alert, ScrollView, Platform } from 'react-native';
import { format } from 'date-fns';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { BookingCard } from '../components/booking/BookingCard';
import { subscribeToBookings, unsubscribeFromBookings } from '../utils/bookingSubscription';
import supabase from '../services/supabase';
import { Booking, BookingStatus } from '../types/booking';
import { X, AlertCircle, Star, HelpCircle } from 'lucide-react-native';
import { RatingModal } from '../components/booking/RatingModalProps';
import { useNavigation } from '@react-navigation/native';
import { shouldAutoCancel } from '../utils/shouldAutoCancel';

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

  // Add this function inside the BookingsScreen component
  const checkAndHandleAutoCancellations = async (bookings: Booking[]) => {
    for (const booking of bookings) {
      const { shouldCancel, reason } = shouldAutoCancel(booking);
      
      if (shouldCancel) {
        try {
          const { error } = await supabase
            .from('bookings')
            .update({ 
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              cancellation_reason: reason,
              cancellation_type: 'auto',
              cancellation_notification_sent: true,
              cancellation_notification_time: new Date().toISOString()
            })
            .eq('id', booking.id);
            
          if (error) throw error;
        } catch (error) {
          console.error('Error auto-cancelling booking:', error);
        }
      }
    }
  };

  // Update the fetchBookings function to include auto-cancellation check
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
          cancelled_at,
          cancellation_reason,
          cancellation_type,
          cancellation_notification_sent,
          cancellation_notification_time,
          restored_at,
          restored_by,
          restoration_reason,
          tutors (
            name
          )
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      
      // Check for bookings that need to be auto-cancelled
      await checkAndHandleAutoCancellations(data || []);
      
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

function renderCancellationDetails(booking: Booking): React.ReactNode {
  if (booking.status !== 'cancelled') return null;
  
  return (
    <View style={styles.detailSection}>
      <Text style={styles.sectionTitle}>Cancellation Details</Text>
      
      {booking.cancelled_at && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cancelled At:</Text>
          <Text style={styles.detailValue}>
            {format(new Date(booking.cancelled_at), 'MMM d, yyyy h:mm a')}
          </Text>
        </View>
      )}

      {booking.cancellation_type && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={[styles.detailValue, styles.cancellationType]}>
            {booking.cancellation_type.charAt(0).toUpperCase() + 
             booking.cancellation_type.slice(1)}
          </Text>
        </View>
      )}

      {booking.cancellation_reason && (
        <View style={[styles.detailRow, styles.reasonRow]}>
          <Text style={styles.detailLabel}>Reason:</Text>
          <Text style={[styles.detailValue, styles.reasonText]}>
            {booking.cancellation_reason}
          </Text>
        </View>
      )}

      {/* Restoration information if booking was restored */}
      {booking.restored_at && (
        <View style={styles.restorationInfo}>
          <Text style={styles.sectionTitle}>Booking Restored</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Restored On:</Text>
            <Text style={styles.detailValue}>
              {format(new Date(booking.restored_at), 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
          {booking.restoration_reason && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reason:</Text>
              <Text style={styles.detailValue}>{booking.restoration_reason}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Update the BookingDetailModal component
const BookingDetailModal = ({ booking, visible, onClose, onRating }: BookingDetailModalProps) => {
  const navigation = useNavigation();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add handleRatingSubmit function
  const handleRatingSubmit = async (rating: number) => {
    try {
      await handleRating(booking.id, booking.tutor_id, rating);
      setShowRatingModal(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const handleViewTutor = async () => {
    try {
      // Fetch full tutor data
      const { data: tutorData, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('id', booking.tutor_id)
        .single();

      if (error) throw error;

      // Navigate to tutor profile
      navigation.navigate('TutorProfile', { tutor: tutorData });
    } catch (error) {
      console.error('Error fetching tutor data:', error);
      Alert.alert('Error', 'Failed to load tutor profile');
    }
  };

  // Add handleCancelBooking function
  const handleCancelBooking = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Cancelled by student',
          cancellation_type: 'manual',
          cancellation_notification_sent: true,
          cancellation_notification_time: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;
      
      Alert.alert('Success', 'Booking cancelled successfully');
      onClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Add confirmation dialog
  const confirmCancellation = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: handleCancelBooking 
        }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => {
                  onClose();
                  navigation.navigate('DisputeResolution', {
                    bookingId: booking.id,
                    tutorName: booking.tutors?.name,
                    userRole: 'student'
                  });
                }}
                style={styles.helpButton}
              >
                <HelpCircle size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalClose} onPress={onClose}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
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

              {/* Cancellation Details Section */}
              {renderCancellationDetails(booking)}

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

              {/* Add Cancel Booking Button */}
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <View style={styles.cancelButtonContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.cancelButton,
                      isLoading && styles.disabledButton
                    ]}
                    onPress={confirmCancellation}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
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
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingTop: 20,
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
    paddingLeft: Platform.OS === 'ios' ? 16 : 0,
    
  },
  modalClose:{
    paddingRight: Platform.OS === 'ios' ? 16 : 0,
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
    gap: 16,
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
  cancellationSection: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  reasonRow: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  reasonText: {
    textAlign: 'right',
    lineHeight: 20,
  },
  cancellationType: {
    color: '#D32F2F',
    fontWeight: '500',
  },
  restorationInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelButtonContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpButton: {
    padding: 2,
  },
});

export default BookingsScreen;
