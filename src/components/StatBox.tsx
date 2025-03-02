import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { DollarSign, Users } from 'lucide-react-native';
import { colors } from '../theme/Theme';

interface StatBoxProps {
  title: string;
  value: string;
  icon: string;
}

const StatBox = ({ title, value, icon }: StatBoxProps) => {
  const renderIcon = () => {
    switch (icon) {
      case 'dollar-sign':
        return <DollarSign size={24} color={colors.primary} />;
      case 'users':
        return <Users size={24} color={colors.primary} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderIcon()}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    color: '#666',
  },
});

export default StatBox;