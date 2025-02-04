import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format, parseISO, addDays } from 'date-fns';
import  supabase  from '../services/supabase'; // Assuming you have a supabase client setup

/*
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];
*/

interface TutorAvailability {
  weeklySchedule: {
    [key: string]: { 
      available: boolean;
      slots: Array<{
        start: string;
        end: string;
      }>;
    };
  };
  exceptions: Array<{
    date: string;
    available: boolean;
    slots?: Array<{
      start: string;
      end: string;
    }>;
  }>;
  timezone: string;
}

// Add this utility function at the top of the file
const generateTimeSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  const [startHour] = start.split(':').map(Number);
  const [endHour] = end.split(':').map(Number);
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  return slots;
};

const BookingCalendarScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tutorId, tutorName, price } = route.params;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [tutorAvailability, setTutorAvailability] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Get tutor's availability when component mounts
  useEffect(() => {
    const fetchTutorAvailability = async () => {
      const { data, error } = await supabase
        .from('tutors')
        .select('availability')
        .eq('id', tutorId)
        .single();
      
      if (error) {
        console.error('Error fetching tutor availability:', error);
        return;
      }
      
      setTutorAvailability(data?.availability);
    };

    fetchTutorAvailability();
  }, [tutorId]);

  // Generate marked dates for calendar
  const markedDates = useMemo(() => {
    if (!tutorAvailability) return {};

    const marks = {};
    
    // Mark regular weekly schedule
    const next30Days = [...Array(30)].map((_, i) => 
      format(addDays(new Date(), i), 'yyyy-MM-dd')
    );

    next30Days.forEach(date => {
      const dayOfWeek = parseISO(date).getDay().toString();
      const daySchedule = tutorAvailability.weeklySchedule[dayOfWeek];
      
      // Check exceptions
      const exception = tutorAvailability.exceptions.find(e => e.date === date);
      
      marks[date] = {
        marked: true,
        dotColor: exception?.available ?? daySchedule.available ? '#4CAF50' : '#FF0000',
        selected: date === selectedDate,
        selectedColor: '#084843'
      };
    });

    return marks;
  }, [tutorAvailability, selectedDate]);

  // Update available time slots when date is selected
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    
    if (tutorAvailability) {
      const dayOfWeek = parseISO(date).getDay().toString();
      const exception = tutorAvailability.exceptions.find(e => e.date === date);
      
      // Use exception slots if present, otherwise use regular schedule
      const slots = exception?.slots || tutorAvailability.weeklySchedule[dayOfWeek].slots;
      
      // Generate all available time slots for each slot range
      const allTimeSlots = slots.flatMap(slot => 
        generateTimeSlots(slot.start, slot.end)
      );
      
      setAvailableTimeSlots(allTimeSlots);
    }
  };

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
        onDayPress={(day) => handleDateSelect(day.dateString)}
        markedDates={markedDates}
        minDate={format(new Date(), 'yyyy-MM-dd')}
        theme={{
          todayTextColor: '#084843',
          selectedDayBackgroundColor: '#084843',
        }}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
          <Text>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FF0000' }]} />
          <Text>Unavailable</Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.sectionTitle}>Available Times</Text>
        <ScrollView>
          <View style={styles.timeGrid}>
            {availableTimeSlots.map((time) => (
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    gap: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  }
});

export default BookingCalendarScreen;
