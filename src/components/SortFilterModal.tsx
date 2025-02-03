import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/Theme';

export type SortOption = 'price_asc' | 'price_desc' | 'distance_asc' | 'remote';
export type Filters = {
  price: number;
  distance: number;
  isRemoteOnly: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
};

const SortFilterModal = ({ 
  visible, 
  onClose, 
  onApply, 
  sortBy, 
  setSortBy, 
  filters, 
  setFilters 
}: Props) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort & Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.optionsContainer}>
                {[
                  { id: 'price_asc', label: 'Price: Low to High' },
                  { id: 'price_desc', label: 'Price: High to Low' },
                  { id: 'distance_asc', label: 'Distance' },
                  { id: 'remote', label: 'Remote Only' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      sortBy === option.id && styles.selectedOption
                    ]}
                    onPress={() => setSortBy(option.id as SortOption)}
                  >
                    <Text style={[
                      styles.optionText,
                      sortBy === option.id && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <Text style={styles.rangeValue}>
                NT$ {filters.price === 2000 ? '2000+' : filters.price}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={2000}
                step={100}
                value={filters.price}
                onValueChange={(value) => setFilters({...filters, price: value})}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E0E0E0"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distance</Text>
              <Text style={styles.rangeValue}>{filters.distance} km</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={0.5}
                value={filters.distance}
                onValueChange={(value) => setFilters({...filters, distance: value})}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E0E0E0"
              />
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.applyButton}
            onPress={onApply}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: '#666',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#FFF',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeValue: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  applyButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SortFilterModal;