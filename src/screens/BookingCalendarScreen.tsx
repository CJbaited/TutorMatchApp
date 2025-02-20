import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { TimeSlot } from '../types/booking';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format, parseISO, addDays } from 'date-fns';
import  supabase  from '../services/supabase'; // Assuming you have a supabase client setup
import { useRequireAuth } from '../hooks/useRequireAuth';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { BookingScreenProps } from '../types/booking';

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

// Update the generateTimeSlots function
const generateTimeSlots = (start: string, end: string) => {
  const slots: string[] = [];
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  for (let time = startTime; time < endTime; time += 60) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    slots.push(
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    );
  }
  
  return slots;
};

const BookingCalendarContent = () => {
  const { user } = useRequireAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { tutorId, tutorName, price } = route.params;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [tutorAvailability, setTutorAvailability] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleError = (error: any) => {
    console.error('Calendar error:', error);
    Alert.alert(
      'Error',
      'Unable to load availability. Please try again.',
      [
        {
          text: 'Retry',
          onPress: () => fetchTutorAvailability()
        }
      ]
    );
  };

  // Get tutor's availability when component mounts
  useEffect(() => {
    const fetchTutorAvailability = async () => {
      try {
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
      } catch (error) {
        handleError(error);
      }
    };

    fetchTutorAvailability();
  }, [tutorId]);

  // Update the fetchOccupiedSlots function
  const fetchOccupiedSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('date, time, status')
        .eq('tutor_id', tutorId)
        .in('status', ['pending', 'confirmed']); // Only get active bookings
      
      if (error) {
        console.error('Error fetching occupied slots:', error);
        return;
      }
      
      // Filter out cancelled bookings
      const activeBookings = data?.filter(booking => 
        booking.status !== 'cancelled'
      ) || [];
      
      setOccupiedSlots(activeBookings);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Add useEffect to fetch occupied slots
  useEffect(() => {
    fetchOccupiedSlots();
  }, [tutorId]);

  // Add this inside the BookingCalendarScreen component
  useEffect(() => {
    const subscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `tutor_id=eq.${tutorId}`
        },
        () => {
          fetchOccupiedSlots(); // Refresh occupied slots when bookings change
        }
      )
      .subscribe();
  
    return () => {
      subscription.unsubscribe();
    };
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

  // Update handleDateSelect to properly filter occupied slots
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    
    if (tutorAvailability) {
      const dayOfWeek = parseISO(date).getDay().toString();
      const daySchedule = tutorAvailability.weeklySchedule[dayOfWeek];
      
      if (!daySchedule?.available) {
        setAvailableTimeSlots([]);
        return;
      }

      // Get all possible time slots from tutor's ranges
      const allTimeSlots = daySchedule.ranges.flatMap(range => 
        generateTimeSlots(range.start, range.end)
      );

      // Filter out occupied slots for this date
      const dateOccupiedTimes = occupiedSlots
        .filter(slot => 
          slot.date === date && 
          slot.status !== 'cancelled'
        )
        .map(slot => slot.time.slice(0, 5));

      // If it's today, filter out past times
      const now = new Date();
      const selectedDateObj = new Date(date);
      const isToday = selectedDateObj.toDateString() === now.toDateString();

      const availableSlots = allTimeSlots.filter(time => {
        // Filter out occupied slots
        if (dateOccupiedTimes.includes(time)) {
          return false;
        }

        // For today, filter out past times
        if (isToday) {
          const [hours, minutes] = time.split(':').map(Number);
          const slotTime = new Date(now);
          slotTime.setHours(hours, minutes, 0, 0);
          
          // Add buffer time (e.g., 15 minutes) to current time
          const currentTime = new Date(now);
          currentTime.setMinutes(currentTime.getMinutes() + 15);
          
          return slotTime > currentTime;
        }

        return true;
      });

      setAvailableTimeSlots(availableSlots);
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

  // Update the time slots rendering
  const renderTimeSlots = () => (
    <View style={styles.timeGrid}>
      {availableTimeSlots.map((time) => (
        <TouchableOpacity
          key={time}
          style={[
            styles.timeSlot,
            selectedTime === time && styles.selectedTimeSlot,
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
  );

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
      const formattedTime = time + ':00';
  
      // Check for any active bookings in this slot
      const { data: existingActive, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('date', formattedDate)
        .eq('time', formattedTime)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle();
  
      if (checkError) {
        console.error('Error checking bookings:', checkError);
        Alert.alert('Error', 'Failed to verify time slot availability');
        return;
      }
  
      if (existingActive) {
        Alert.alert('Error', 'This time slot is no longer available');
        return;
      }
  
      // Create new booking
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          tutor_id: tutorId,
          student_id: user.id,
          date: formattedDate,
          time: formattedTime,
          status: 'pending',
          price: Number(price),
          payment_method: paymentMethod,
        });
  
      if (insertError) {
        console.error('Booking error details:', insertError);
        Alert.alert('Error', 'Failed to create booking');
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
          {renderTimeSlots()}
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

const BookingCalendarScreen = () => (
  <ErrorBoundary>
    <BookingCalendarContent />
  </ErrorBoundary>
);

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
