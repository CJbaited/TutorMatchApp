import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert, Platform } from 'react-native';
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

// Add these helper functions before the component
const isBookingTimeReached = (date: string, time: string): boolean => {
  const bookingDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  return now >= bookingDateTime;
};

const formatTimeForDisplay = (time: string): string => {
  return format(new Date(`2000-01-01T${time}`), 'h:mm a');
};

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'today', label: 'Today' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'past', label: 'Past' }
];

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
  const [activeTab, setActiveTab] = useState('upcoming');

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

  // Update the renderBookingCard function to properly show action buttons
  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity 
      key={booking.id} 
      style={[
        styles.sessionCard,
        isBookingTimeReached(booking.date, booking.time) && booking.status === 'confirmed' 
          ? styles.activeSessionCard 
          : null
      ]}
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
  
      // Check for existing conversation
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('student_id', studentId)
        .eq('tutor_id', user.id)
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
            student_id: studentId,
            tutor_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
  
        if (createError) throw createError;
        conversationId = newConv.id;
      }
  
      // Close modal before navigation
      setModalVisible(false);
      
      // Navigate to chat
      navigation.navigate('Chat', {
        conversationId,
        participantId: studentId,
        participantName: studentName
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const canCompleteSession = (booking: Booking) => {
    if (booking.status !== 'confirmed' || !booking.started_at) return false;
    
    const startTime = new Date(booking.started_at);
    const now = new Date();
    const hoursSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceStart >= 1; // Can complete after 1 hour
  };

  const handleStartSession = async (bookingId: string) => {
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          started_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', bookingId);
        
      if (error) throw error;

      fetchBookings(); // Refresh the list
      Alert.alert('Success', 'Session started successfully');
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSession = async (bookingId: string) => {
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          completed_at: new Date().toISOString(),
          status: 'completed',
          completion_type: 'manual'
        })
        .eq('id', bookingId);
        
      if (error) throw error;

      // Trigger payment processing if needed
      await supabase.functions.invoke('process-session-payment', {
        body: { bookingId }
      });

      fetchBookings(); // Refresh the list
      Alert.alert('Success', 'Session completed successfully');
    } catch (error) {
      console.error('Error completing session:', error);
      Alert.alert('Error', 'Failed to complete session');
    } finally {
      setActionLoading(false);
    }
  };

  // Update the canStartSession function
  const canStartSession = (booking: Booking): boolean => {
    if (booking.status !== 'confirmed') return false;
    return isBookingTimeReached(booking.date, booking.time);
  };

  const getTodayBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === today);
  };

  const getUpcomingBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings
      .filter(booking => booking.date > today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getPastBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings
      .filter(booking => booking.date < today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <ScrollView style={styles.tabContent}>
            {getUpcomingBookings().map(renderBookingCard)}
          </ScrollView>
        );
      case 'today':
        return (
          <ScrollView style={styles.tabContent}>
            {getTodayBookings().map(renderBookingCard)}
          </ScrollView>
        );
      case 'calendar':
        return (
          <ScrollView style={styles.tabContent}>
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
            {selectedDate && (
              <View style={styles.selectedDateSessions}>
                <Text style={styles.dateHeader}>
                  Sessions for {format(new Date(selectedDate), 'MMMM d, yyyy')}
                </Text>
                {getBookingsForDate().map(renderBookingCard)}
              </View>
            )}
          </ScrollView>
        );
      case 'past':
        return (
          <ScrollView style={styles.tabContent}>
            {getPastBookings().map(renderBookingCard)}
          </ScrollView>
        );
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

      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

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

                  {selectedBooking.status === 'confirmed' && !selectedBooking.started_at && (
                    <TouchableOpacity 
                      style={[
                        styles.sessionButton,
                        {
                          backgroundColor: canStartSession(selectedBooking) ? '#4CAF50' : '#ccc'
                        }
                      ]}
                      onPress={() => handleStartSession(selectedBooking.id)}
                      disabled={!canStartSession(selectedBooking) || actionLoading}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          <Text style={styles.actionButtonText}>
                            {canStartSession(selectedBooking) 
                              ? 'Start Session' 
                              : `Available at ${formatTimeForDisplay(selectedBooking.time)}`
                            }
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {selectedBooking.status === 'confirmed' && selectedBooking.started_at && canCompleteSession(selectedBooking) && (
                    <TouchableOpacity 
                      style={[styles.sessionButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => handleCompleteSession(selectedBooking.id)}
                      disabled={actionLoading}
                    >
                      <Text style={styles.actionButtonText}>Complete Session</Text>
                    </TouchableOpacity>
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
    marginBottom: Platform.OS === 'ios' ? 40 : 0,
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
    minHeight: 52,
    marginBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  sessionButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 8 : 0,
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
  activeSessionCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  disabledText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
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
    fontWeight: '400',
  },
  activeTabText: {
    color: '#084843',
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
  },
  selectedDateSessions: {
    marginTop: 16,
  }
});

export default TutorScheduleScreen;
