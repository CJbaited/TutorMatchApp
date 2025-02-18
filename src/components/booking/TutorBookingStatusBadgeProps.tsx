import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

interface TutorBookingStatusBadgeProps {
  status: string;
}

export const TutorBookingStatusBadge = ({ status }: TutorBookingStatusBadgeProps) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'in_progress':
        return styles.statusInProgress;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'confirmed':
        return '#1976D2';
      case 'in_progress':
        return '#F57C00';
      case 'completed':
        return '#388E3C';
      case 'cancelled':
        return '#D32F2F';
      case 'pending':
        return '#7B1FA2';
      default:
        return '#616161';
    }
  };

  return (
    <View style={[styles.statusBadge, getStatusStyle()]}>
      <Text style={[styles.statusText, { color: getStatusTextColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusConfirmed: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  statusInProgress: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 1,
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF5252',
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
    borderWidth: 1,
  },
  statusDefault: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
    borderWidth: 1,
  },
});