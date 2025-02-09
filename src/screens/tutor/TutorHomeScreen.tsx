import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, TrendingUp, Users, DollarSign } from 'lucide-react-native';
import supabase from '../../services/supabase';

const TutorHomeScreen = () => {
  const [stats, setStats] = useState({
    weeklyEarnings: 0,
    totalStudents: 0,
    upcomingLessons: 0,
    rating: 0,
  });

  useEffect(() => {
    fetchTutorStats();
  }, []);

  const fetchTutorStats = async () => {
    // Implementation will come later
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Weekly Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <DollarSign size={24} color="#084843" />
            <Text style={styles.statsAmount}>${stats.weeklyEarnings}</Text>
            <Text style={styles.statsLabel}>Weekly Earnings</Text>
          </View>

          <View style={styles.statsCard}>
            <Users size={24} color="#084843" />
            <Text style={styles.statsAmount}>{stats.totalStudents}</Text>
            <Text style={styles.statsLabel}>Active Students</Text>
          </View>
        </View>

        {/* Promotional Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotional Tools</Text>
          <View style={styles.promotionalGrid}>
            <TouchableOpacity style={styles.promotionalCard}>
              <Text style={styles.cardTitle}>Share Profile</Text>
              <Text style={styles.cardDescription}>
                Share your profile link with potential students
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.promotionalCard}>
              <Text style={styles.cardTitle}>Boost Visibility</Text>
              <Text style={styles.cardDescription}>
                Increase your visibility in search results
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Update Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Message Students</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Analytics</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  statsAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginVertical: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  promotionalGrid: {
    gap: 16,
  },
  promotionalCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#084843',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TutorHomeScreen;
