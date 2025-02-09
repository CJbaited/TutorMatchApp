import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Clock, MapPin } from 'lucide-react-native';

const TutorScheduleScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
      </View>

      <ScrollView style={styles.content}>
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#084843' }
          }}
          theme={{
            todayTextColor: '#084843',
            selectedDayBackgroundColor: '#084843',
          }}
        />

        <View style={styles.sessionsContainer}>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.studentName}>Sarah Johnson</Text>
              <Text style={styles.subject}>Mathematics</Text>
            </View>
            
            <View style={styles.sessionDetails}>
              <View style={styles.detailRow}>
                <Clock size={16} color="#666" />
                <Text style={styles.detailText}>2:00 PM - 3:30 PM</Text>
              </View>
              <View style={styles.detailRow}>
                <MapPin size={16} color="#666" />
                <Text style={styles.detailText}>Online Session</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.button, styles.rescheduleButton]}>
                <Text style={styles.rescheduleButtonText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.startButton]}>
                <Text style={styles.startButtonText}>Start Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  sessionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  sessionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subject: {
    fontSize: 14,
    color: '#084843',
    fontWeight: '500',
  },
  sessionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rescheduleButton: {
    backgroundColor: '#F0F0F0',
  },
  startButton: {
    backgroundColor: '#084843',
  },
  rescheduleButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TutorScheduleScreen;
