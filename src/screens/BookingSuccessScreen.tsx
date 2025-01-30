import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const BookingSuccessScreen = () => {
  const navigation = useNavigation();

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        { 
          name: 'DevHome', // or 'Home' based on your initial route
          params: {
            screen: 'Home' // This specifies the initial tab
          }
        }
      ],
    });
  };

  return (
    <View style={styles.container}>
      <CheckCircle size={80} color="#084843" />
      <Text style={styles.title}>Booking Successful!</Text>
      <Text style={styles.message}>
        Your session has been booked successfully. You can view your booking details in the My Bookings section.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleGoHome}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#084843',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BookingSuccessScreen;
