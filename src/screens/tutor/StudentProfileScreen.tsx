import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import supabase from '../../services/supabase';
import { User } from 'lucide-react-native';

const StudentProfileScreen = ({ route }) => {
  const { studentId } = route.params;
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Fetch basic student profile
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('name, image_url')
        .eq('user_id', studentId)
        .single();

      if (studentError) throw studentError;

      // Fetch student's bookings separately
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (bookingsError) throw bookingsError;

      setStudent(studentData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
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
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {student?.image_url ? (
              <Image 
                source={{ uri: student.image_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#666" />
              </View>
            )}
          </View>
          <Text style={styles.name}>{student?.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Booking History</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Bookings:</Text>
            <Text style={styles.value}>{bookings.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Completed Sessions:</Text>
            <Text style={styles.value}>
              {bookings.filter(b => b.status === 'completed').length}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cancelled Sessions:</Text>
            <Text style={styles.value}>
              {bookings.filter(b => b.status === 'cancelled').length}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {bookings.slice(0, 5).map((booking, index) => (
            <View key={booking.id} style={styles.bookingItem}>
              <Text style={styles.bookingDate}>
                {new Date(booking.date).toLocaleDateString()}
              </Text>
              <Text style={[styles.bookingStatus, styles[`status${booking.status}`]]}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Text>
            </View>
          ))}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bookingDate: {
    fontSize: 16,
    color: '#333',
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statuspending: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusconfirmed: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  statuscancelled: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  statuscompleted: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
});

export default StudentProfileScreen;