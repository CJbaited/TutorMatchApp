import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Switch, Alert, ActivityIndicator, Platform, TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/Theme';
import supabase from '../../services/supabase';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TimeRange {
  start: string;
  end: string;
}

interface DaySchedule {
  available: boolean;
  ranges: TimeRange[];
}

interface Schedule {
  weeklySchedule: {
    [key: string]: DaySchedule;
  };
  exceptions: any[]; // Define proper type if needed
  timezone: string;
}

const validateTimeFormat = (time: string): boolean => {
  // Check basic HH:MM format
  if (!/^\d{1,2}:\d{2}$/.test(time)) {
    return false;
  }

  const [hours, minutes] = time.split(':').map(Number);
  
  // Validate hours and minutes
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return false;
  }

  return true;
};

const formatTimeInput = (input: string): string => {
  // Remove non-numeric characters except colon
  let cleaned = input.replace(/[^\d:]/g, '');
  
  // Handle colon input
  if (cleaned.length >= 2 && !cleaned.includes(':')) {
    cleaned = cleaned.substring(0, 2) + ':' + cleaned.substring(2);
  }
  
  // Limit to 5 characters (HH:MM)
  return cleaned.substring(0, 5);
};

const TutorScheduleEditScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<Schedule>({
    weeklySchedule: Object.fromEntries(
      DAYS.map((_, index) => [
        index,
        {
          available: false,
          ranges: [] // Initialize empty array for ranges
        }
      ])
    ),
    exceptions: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [newRange, setNewRange] = useState<{[key: number]: TimeRange}>({});

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
      
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
  
      // First get the tutor record
      const { data: tutor, error: tutorError } = await supabase
        .from('tutors')
        .select('id')
        .eq('user_id', user.id)
        .single();
  
      if (tutorError || !tutor) {
        console.error('Error fetching tutor:', tutorError);
        Alert.alert('Error', 'Failed to fetch tutor data');
        return;
      }
  
      // Update availability using tutor.id
      const { error: updateError } = await supabase
        .from('tutors')
        .update({ availability: schedule })
        .eq('id', tutor.id);
  
      if (updateError) {
        console.error('Error saving schedule:', updateError);
        Alert.alert('Error', 'Failed to save schedule');
        return;
      }
  
      Alert.alert('Success', 'Schedule updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
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

  const addTimeRange = (dayIndex: number) => {
    // Validate inputs
    const timeRange = newRange[dayIndex];
    if (!timeRange?.start || !timeRange?.end) {
      Alert.alert('Error', 'Please select both start and end times');
      return;
    }
  
    // Validate time format (optional but recommended)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeRange.start) || !timeRegex.test(timeRange.end)) {
      Alert.alert('Error', 'Please use valid time format (HH:MM)');
      return;
    }
  
    // Convert to 24-hour numbers for comparison
    const startParts = timeRange.start.split(':').map(Number);
    const endParts = timeRange.end.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
  
    // Validate time range
    if (endMinutes <= startMinutes) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }
  
    setSchedule(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [dayIndex]: {
          ...prev.weeklySchedule[dayIndex],
          ranges: [
            ...(prev.weeklySchedule[dayIndex].ranges || []),
            {
              start: timeRange.start,
              end: timeRange.end
            }
          ]
        }
      }
    }));
  
    // Reset input for this day
    setNewRange(prev => ({
      ...prev,
      [dayIndex]: { start: '', end: '' }
    }));
  };

  const removeTimeRange = (dayIndex: number, rangeIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [dayIndex]: {
          ...prev.weeklySchedule[dayIndex],
          ranges: prev.weeklySchedule[dayIndex].ranges.filter((_, index) => index !== rangeIndex)
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
                  value={schedule.weeklySchedule[index]?.available || false}
                  onValueChange={() => toggleDayAvailability(index)}
                  trackColor={{ false: '#D1D1D1', true: colors.primary }}
                />
              </View>
              
              {schedule.weeklySchedule[index]?.available && (
                <View style={styles.timeRangesContainer}>
                  {schedule.weeklySchedule[index]?.ranges?.map((range, rangeIndex) => (
                    <View key={rangeIndex} style={styles.timeRange}>
                      <Text style={styles.timeRangeText}>
                        {range.start} - {range.end}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => removeTimeRange(index, rangeIndex)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <View style={styles.addRangeContainer}>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="Start (HH:MM)"
                      value={newRange[index]?.start || ''}
                      keyboardType="numeric"
                      maxLength={5}
                      onChangeText={(text) => {
                        const formatted = formatTimeInput(text);
                        setNewRange(prev => ({
                          ...prev,
                          [index]: { ...prev[index], start: formatted }
                        }));
                      }}
                      onBlur={() => {
                        const timeValue = newRange[index]?.start;
                        if (timeValue && !validateTimeFormat(timeValue)) {
                          Alert.alert('Invalid Time', 'Please enter a valid time in HH:MM format (00:00 - 23:59)');
                          setNewRange(prev => ({
                            ...prev,
                            [index]: { ...prev[index], start: '' }
                          }));
                        }
                      }}
                    />
                    <Text style={styles.timeRangeSeparator}>-</Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="End (HH:MM)"
                      value={newRange[index]?.end || ''}
                      keyboardType="numeric"
                      maxLength={5}
                      onChangeText={(text) => {
                        const formatted = formatTimeInput(text);
                        setNewRange(prev => ({
                          ...prev,
                          [index]: { ...prev[index], end: formatted }
                        }));
                      }}
                      onBlur={() => {
                        const timeValue = newRange[index]?.end;
                        if (timeValue && !validateTimeFormat(timeValue)) {
                          Alert.alert('Invalid Time', 'Please enter a valid time in HH:MM format (00:00 - 23:59)');
                          setNewRange(prev => ({
                            ...prev,
                            [index]: { ...prev[index], end: '' }
                          }));
                        }
                      }}
                    />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => addTimeRange(index)}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
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
  timeRangesContainer: {
    marginTop: 8,
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  timeRangeText: {
    color: '#FFF',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  addRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeRangeSeparator: {
    color: '#666',
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
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
