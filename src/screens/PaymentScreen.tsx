import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CreditCard, DollarSign } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tutorName, price, date, time } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('card');

  const handleConfirm = () => {
    navigation.navigate('BookingConfirmation', {
      ...route.params,
      paymentMethod: selectedMethod,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Summary</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>Tutor</Text>
          <Text style={styles.value}>{tutorName}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{time}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.price}>${price}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity 
          style={[styles.methodCard, selectedMethod === 'card' && styles.selected]}
          onPress={() => setSelectedMethod('card')}
        >
          <CreditCard size={24} color={selectedMethod === 'card' ? '#084843' : '#666'} />
          <Text style={[styles.methodText, selectedMethod === 'card' && styles.selectedText]}>
            Credit/Debit Card
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.methodCard, selectedMethod === 'cash' && styles.selected]}
          onPress={() => setSelectedMethod('cash')}
        >
          <DollarSign size={24} color={selectedMethod === 'cash' ? '#084843' : '#666'} />
          <Text style={[styles.methodText, selectedMethod === 'cash' && styles.selectedText]}>
            Cash Payment
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    color: '#084843',
    fontWeight: '600',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  selected: {
    backgroundColor: '#E8F3F3',
    borderColor: '#084843',
    borderWidth: 1,
  },
  methodText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#666',
  },
  selectedText: {
    color: '#084843',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#084843',
    padding: 16,
    margin: 20,
    borderRadius: 28,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PaymentScreen;
