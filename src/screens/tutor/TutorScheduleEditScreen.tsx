import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Switch, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/Theme';
import supabase from '../../services/supabase';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
];

const TutorScheduleEditScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState({
    weeklySchedule: DAYS.reduce((acc, day, index) => ({
      ...acc,
      [index]: {
        available: false,
        slots: TIME_SLOTS
      }
    }), {}),
    exceptions: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('tutors')
        .select('availability')
        .eq('user_id', user.id)
        .single();

      if (data?.availability) {
        setSchedule(data.availability);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('tutors')
        .update({ availability: schedule })
        .eq('user_id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Schedule updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDayAvailability = (dayIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [dayIndex]: {
          ...prev.weeklySchedule[dayIndex],
          available: !prev.weeklySchedule[dayIndex].available
        }
      }
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          {DAYS.map((day, index) => (
            <View key={day} style={styles.dayRow}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayText}>{day}</Text>
                <Switch
                  value={schedule.weeklySchedule[index].available}
                  onValueChange={() => toggleDayAvailability(index)}
                  trackColor={{ false: '#D1D1D1', true: colors.primary }}
                />
              </View>
              {schedule.weeklySchedule[index].available && (
                <View style={styles.timeSlots}>
                  {schedule.weeklySchedule[index].slots.map((slot, slotIndex) => (
                    <View key={slotIndex} style={styles.timeSlot}>
                      <Text style={styles.timeText}>
                        {slot.start} - {slot.end}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  dayRow: {
    marginBottom: 16,
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default TutorScheduleEditScreen;