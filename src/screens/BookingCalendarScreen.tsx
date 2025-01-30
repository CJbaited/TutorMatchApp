import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

const BookingCalendarScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tutorId, tutorName, price } = route.params;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      navigation.navigate('Payment', {
        tutorId,
        tutorName,
        price,
        date: selectedDate,
        time: selectedTime,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#084843' }
        }}
        minDate={format(new Date(), 'yyyy-MM-dd')}
        theme={{
          todayTextColor: '#084843',
          selectedDayBackgroundColor: '#084843',
        }}
      />

      <View style={styles.timeContainer}>
        <Text style={styles.sectionTitle}>Available Times</Text>
        <ScrollView>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedTimeText
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedDate || !selectedTime) && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={!selectedDate || !selectedTime}
      >
        <Text style={styles.continueButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timeContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#084843',
  },
  timeText: {
    color: '#333',
    fontSize: 16,
  },
  selectedTimeText: {
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#084843',
    padding: 16,
    margin: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BookingCalendarScreen;
