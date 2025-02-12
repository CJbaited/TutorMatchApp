import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Clock, MapPin, Calendar as LucideCalendar } from 'lucide-react-native';
import supabase from '../../services/supabase';
import { format } from 'date-fns';

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
  const [selectedDate, setSelectedDate] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});

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
  );

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
    padding: 16,
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
});

export default TutorScheduleScreen;
