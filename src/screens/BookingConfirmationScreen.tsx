import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import  supabase  from '../services/supabase';

const BookingConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tutorId, tutorName, price, date, time, paymentMethod } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Format the date and time properly
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const formattedTime = time + ':00'; // Add seconds for proper time format

      // Create booking record
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          tutor_id: tutorId,
          student_id: user.id,
          date: formattedDate,
          time: formattedTime,
          status: 'pending',
          price: Number(price), // Ensure price is a number
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (error) {
        console.error('Booking error details:', error);
        
        if (error.code === '23505') {
          Alert.alert('Error', 'This time slot is no longer available');
        } else if (error.code === '23503') {
          Alert.alert('Error', 'Invalid tutor or student reference');
        } else {
          Alert.alert('Error', 'Failed to create booking: ' + error.message);
        }
        return;
      }

      navigation.navigate('BookingSuccess');
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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

      <TouchableOpacity 
        style={[styles.confirmButton, isLoading && styles.disabledButton]} 
        onPress={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Check size={24} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </>
        )}
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
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
});

export default BookingConfirmationScreen;
