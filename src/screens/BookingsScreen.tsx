import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { Calendar, Clock, DollarSign } from 'lucide-react-native';
import supabase from '../services/supabase';

type TabType = 'upcoming' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  tutor_id: string;
  date: string;
  time: string;
  status: string;
  price: number;
  payment_method: string;
  tutors: {
    name: string;
  };
}

const BookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
          tutors (
            name
          )
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled');
      default:
        return [];
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // First verify the booking exists and can be cancelled
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', bookingId)
        .single();

      if (fetchError) {
        console.error('Error fetching booking:', fetchError);
        Alert.alert('Error', 'Could not find booking');
        return;
      }

      if (booking.status !== 'pending' && booking.status !== 'confirmed') {
        Alert.alert('Error', 'This booking cannot be cancelled');
        return;
      }

      // Proceed with cancellation
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (updateError) {
        console.error('Error cancelling booking:', updateError);
        Alert.alert('Error', 'Failed to cancel booking');
        return;
      }

      fetchBookings(); // Refresh the bookings list
      Alert.alert('Success', 'Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.tutorName}>{item.tutors?.name}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#666" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color="#666" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <DollarSign size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.payment_method === 'card' ? 'Credit/Debit Card' : 'Cash Payment'}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, styles[`status${item.status}`]]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      {activeTab === 'upcoming' && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => handleCancelBooking(item.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(['upcoming', 'completed', 'cancelled'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getFilteredBookings()}
        renderItem={renderBookingCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No {activeTab} bookings</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
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
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#084843',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#084843',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#084843',
  },
  bookingDetails: {
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
  cancelButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
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
  statuscancelled: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  statuscompleted: {
    backgroundColor: '#CCE5FF',
    color: '#004085',
  }
});

export default BookingsScreen;
