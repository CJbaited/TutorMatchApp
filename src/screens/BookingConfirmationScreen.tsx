import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Check } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBookings } from '../contexts/BookingContext';

const BookingConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tutorId, tutorName, price, date, time, paymentMethod } = route.params;
  const { addBooking } = useBookings();

  const handleConfirm = () => {
    addBooking({
      tutorId,
      tutorName,
      date,
      time,
      price,
      paymentMethod,
    });
    navigation.navigate('BookingSuccess');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Booking Details</Text>
        
        <View style={styles.detailItem}>
          <Text style={styles.label}>Tutor</Text>
          <Text style={styles.value}>{tutorName}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{date}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{time}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>
            {paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash Payment'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.price}>${price}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Check size={24} color="#fff" />
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  price: {
    fontSize: 18,
    color: '#084843',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#084843',
    flexDirection: 'row',
    padding: 16,
    margin: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default BookingConfirmationScreen;
