import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Booking } from '../../types/booking';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  isActive?: boolean;
}

export const BookingCard = ({ booking, onPress, isActive }: BookingCardProps) => (
  <TouchableOpacity 
    style={[styles.card, isActive && styles.activeCard]}
    onPress={onPress}
  >
    <View style={styles.header}>
      <Text style={styles.name}>
        {booking.tutors?.name || booking.student_profile?.name || 'Unknown'}
      </Text>
      <Text style={styles.price}>${booking.price}</Text>
    </View>

    <View style={styles.details}>
      <View style={styles.detailRow}>
        <Calendar size={16} color="#666" />
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

    <View style={styles.statusContainer}>
      <BookingStatusBadge status={booking.status} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#084843',
  },
  details: {
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
  statusContainer: {
    marginTop: 12,
  },
});
