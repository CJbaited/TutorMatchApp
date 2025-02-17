import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { BookingCard } from '../components/booking/BookingCard';
import { subscribeToBookings, unsubscribeFromBookings } from '../utils/bookingSubscription';
import supabase from '../services/supabase';
import { Booking, BookingStatus } from '../types/booking';

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

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

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
            onPress={() => {/* Navigate to booking details */}}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={() => {/* Implement refresh logic */}}
      />
    </View>
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
});

export default BookingsScreen;
