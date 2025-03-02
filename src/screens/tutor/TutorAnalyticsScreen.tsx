import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { format, subDays } from 'date-fns';
import { analyticsService, TutorAnalytics } from '../../services/analyticsService';
import { colors } from '../../theme/Theme';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Users, Star, Eye } from 'lucide-react-native';

interface AnalyticsData {
  labels: string[];
  earnings: number[];
  sessions: number[];
  ratings: number[];
  views: number[];
}

const initialAnalyticsData: AnalyticsData = {
  labels: [],
  earnings: [],
  sessions: [],
  ratings: [],
  views: []
};

const TutorAnalyticsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialAnalyticsData);
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      if (!user) {
        throw new Error('No authenticated user');
      }

      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');

      const { data, error } = await analyticsService.getTutorAnalytics(
        user.id,
        startDate,
        endDate
      );

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setAnalyticsData({
          labels: data.map(d => format(new Date(d.date), 'MMM d')),
          earnings: data.map(d => d.total_earnings || 0),
          sessions: data.map(d => d.total_sessions || 0),
          ratings: data.map(d => d.avg_rating || 0),
          views: data.map(d => d.views || 0)
        });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to load analytics data. Please try again later.'
      );
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(8, 72, 67, ${opacity})`,
    labelColor: () => '#666',
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary
    }
  };

  const StatCard = ({ title, value, icon, unit = '' }) => (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statValue}>{value}{unit}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
          <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Last 7 Days Performance</Text>
        </View>
      <ScrollView>
    

        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Earnings" 
            value={`$${analyticsData.earnings.reduce((a, b) => a + b, 0)}`}
            icon={<DollarSign size={24} color={colors.primary} />}
          />
          <StatCard 
            title="Total Sessions" 
            value={analyticsData.sessions.reduce((a, b) => a + b, 0)}
            icon={<Users size={24} color={colors.primary} />}
          />
          <StatCard 
            title="Avg Rating" 
            value={(analyticsData.ratings.reduce((a, b) => a + b, 0) / analyticsData.ratings.length || 0).toFixed(1)}
            icon={<Star size={24} color={colors.primary} />}
          />
          <StatCard 
            title="Profile Views" 
            value={analyticsData.views.reduce((a, b) => a + b, 0)}
            icon={<Eye size={24} color={colors.primary} />}
          />
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Earnings Trend</Text>
          <LineChart
            data={{
              labels: analyticsData.labels,
              datasets: [{ data: analyticsData.earnings.length ? analyticsData.earnings : [0] }]
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Sessions Trend</Text>
          <LineChart
            data={{
              labels: analyticsData.labels,
              datasets: [{ data: analyticsData.sessions.length ? analyticsData.sessions : [0] }]
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  chartSection: {
    backgroundColor: '#FFF',
    margin: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default TutorAnalyticsScreen;
