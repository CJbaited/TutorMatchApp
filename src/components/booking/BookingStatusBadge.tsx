import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface BookingStatusBadgeProps {
  status: string;
}

export const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => (
  <Text style={[styles.badge, styles[`status${status}`]]}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Text>
);

const styles = StyleSheet.create({
  badge: {
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statuspending: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusconfirmed: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  statuscancelled: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  statuscompleted: {
    backgroundColor: '#CCE5FF',
    color: '#004085',
  },
  statusin_progress: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
});
