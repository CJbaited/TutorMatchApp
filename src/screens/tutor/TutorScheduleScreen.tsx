import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Clock, MapPin, Calendar as LucideCalendar, X, MessageCircle, AlertTriangle } from 'lucide-react-native';
import supabase from '../../services/supabase';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { useChat } from '../../context/ChatContext';

interface Booking {
  id: string;
  student_id: string;
  date: string;
  time: string;
  status: string;
  price: number;
  payment_method: string;
  student_profile?: {
    name: string;
  }
}

const TutorScheduleScreen = () => {
  const navigation = useNavigation();
  const { addConversation, conversations } = useChat();
  const [selectedDate, setSelectedDate] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get tutor ID first
      const { data: tutorData, error: tutorError } = await supabase
        .from('tutors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (tutorError) {
        console.error('Error fetching tutor:', tutorError);
        return;
      }

      // 2. Fetch bookings using tutor ID
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          student_id,
          date,
          time,
          status,
          price,
          payment_method
        `)
        .eq('tutor_id', tutorData.id)
        .in('status', ['pending', 'confirmed']);

      if (bookingsError) {
        console.error('Bookings fetch error:', bookingsError);
        return;
      }

      // 3. Get student names from profiles
      const studentIds = bookingsData?.map(booking => booking.student_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', studentIds);

      if (profilesError) {
        console.error('Profiles fetch error:', profilesError);
        return;
      }

      // 4. Combine the data
      const bookingsWithProfiles = bookingsData.map(booking => ({
        ...booking,
        student_profile: {
          name: profilesData?.find(profile => profile.user_id === booking.student_id)?.name || 'Unknown Student'
        }
      }));

      setBookings(bookingsWithProfiles);
      updateMarkedDates(bookingsWithProfiles);

    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update calendar marked dates
  const updateMarkedDates = (bookings: Booking[]) => {
    const marks = {};
    bookings.forEach(booking => {
      marks[booking.date] = {
        marked: true,
        dotColor: booking.status === 'confirmed' ? '#084843' : '#FFB800'
      }
    });
    setMarkedDates(marks);
  };

  // Helper to get bookings for selected date
  const getBookingsForDate = () => {
    return bookings.filter(booking => booking.date === selectedDate);
  };

  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity 
      key={booking.id} 
      style={styles.sessionCard}
      onPress={() => {
        setSelectedBooking(booking);
        setModalVisible(true);
      }}
    >
      <View key={booking.id} style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.studentName}>{booking.student_profile?.name}</Text>
          <Text style={styles.price}>${booking.price}</Text>
        </View>
        
        <View style={styles.sessionDetails}>
          <View style={styles.detailRow}>
            <LucideCalendar size={16} color="#666" />
            <Text style={styles.detailText}>
              {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color="#666" />
            <Text style={styles.detailText}>
              {format(new Date(`2000-01-01 ${booking.time}`), 'h:mm a')}
            </Text>
          </View>
        </View>
  
        <View style={styles.sessionStatus}>
          <Text style={[styles.statusText, styles[`status${booking.status}`]]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
        
      if (error) throw error;

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' }
            : booking
        )
      );
      
      setModalVisible(false);
      Alert.alert('Success', 'Booking confirmed successfully');
    } catch (error) {
      console.error('Error confirming booking:', error);
      Alert.alert('Error', 'Failed to confirm booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
        
      if (error) throw error;

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      setModalVisible(false);
      Alert.alert('Success', 'Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = async (studentId: string, studentName: string) => {
    try {
      // Check for existing conversation
      const { data: existingConv, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('student_id', studentId)
        .eq('tutor_id', user.id)
        .single();
  
      if (searchError && searchError.code !== 'PGRST116') throw searchError;
  
      if (existingConv) {
        navigation.navigate('Chat', {
          conversationId: existingConv.id,
          participantId: studentId
        });
        return;
      }
  
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          student_id: studentId,
          tutor_id: user.id
        })
        .select()
        .single();
  
      if (createError) throw createError;
  
      navigation.navigate('Chat', {
        conversationId: newConv.id,
        participantId: studentId
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#084843" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
      </View>

      <ScrollView style={styles.content}>
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#084843'
            }
          }}
          theme={{
            todayTextColor: '#084843',
            selectedDayBackgroundColor: '#084843',
          }}
        />

        <View style={styles.sessionsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedDate ? `Sessions for ${format(new Date(selectedDate), 'MMMM d, yyyy')}` : 'Upcoming Sessions'}
          </Text>
          
          {selectedDate ? (
            getBookingsForDate().length > 0 ? (
              getBookingsForDate().map(renderBookingCard)
            ) : (
              <Text style={styles.noSessionsText}>No sessions scheduled for this date</Text>
            )
          ) : (
            bookings
              .filter(b => new Date(b.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map(renderBookingCard)
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('DisputeResolution', {
                    bookingId: selectedBooking?.id,
                    studentName: selectedBooking?.student_profile?.name,
                    bookingDate: selectedBooking?.date,
                    bookingTime: selectedBooking?.time
                  })}
                  style={styles.emergencyButton}
                >
                  <AlertTriangle size={20} color="#FF4444" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {selectedBooking && (
              <>
                <View style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Student:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.student_profile?.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {format(new Date(selectedBooking.date), 'EEEE, MMMM d, yyyy')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>
                      {format(new Date(`2000-01-01 ${selectedBooking.time}`), 'h:mm a')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[styles.statusText, styles[`status${selectedBooking.status}`]]}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment:</Text>
                    <Text style={styles.detailValue}>${selectedBooking.price}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#084843' }]}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('StudentProfile', { 
                          studentId: selectedBooking?.student_id 
                        });
                      }}
                    >
                      <Text style={styles.actionButtonText}>View Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#084843' }]}
                      onPress={() => handleStartChat(
                        selectedBooking?.student_id,
                        selectedBooking?.student_profile?.name
                      )}
                    >
                      <MessageCircle size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Message</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedBooking.status === 'pending' && (
                    <View style={styles.confirmActions}>
                      <TouchableOpacity 
                        style={[
                          styles.actionButton, 
                          { backgroundColor: '#4CAF50' },
                          actionLoading && styles.disabledButton
                        ]}
                        onPress={() => handleConfirmBooking(selectedBooking.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={styles.actionButtonText}>Confirm</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.actionButton, 
                          { backgroundColor: '#FF4444' },
                          actionLoading && styles.disabledButton
                        ]}
                        onPress={() => handleCancelBooking(selectedBooking.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  sessionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  sessionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#084843',
  },
  sessionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  sessionStatus: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statuspending: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusconfirmed: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  noSessionsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalBody: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalActions: {
    gap: 12,
  },
  emergencyButton: {
    padding: 8,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  viewStudentButton: {
    backgroundColor: '#084843',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default TutorScheduleScreen;
