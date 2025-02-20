import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { HelpCircle, Send } from 'lucide-react-native';
import supabase from '../services/supabase';

const DisputeResolutionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId, studentName, tutorName, userRole } = route.params;
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!issue || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('disputes')
        .insert({
          booking_id: bookingId,
          issue_type: issue,
          description,
          status: 'pending',
          created_by_role: userRole
        });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your dispute has been submitted. Our support team will contact you shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting dispute:', error);
      Alert.alert('Error', 'Failed to submit dispute');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <HelpCircle size={32} color="#084843" />
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <Text style={styles.detail}>
          {userRole === 'student' ? `Tutor: ${tutorName}` : `Student: ${studentName}`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>What issue are you experiencing?</Text>
        <View style={styles.issueButtons}>
          {[
            'Session Not Started',
            'Payment Issue',
            'Inappropriate Behavior',
            'Technical Problems',
            'Other'
          ].map((issueType) => (
            <TouchableOpacity
              key={issueType}
              style={[
                styles.issueButton,
                issue === issueType && styles.selectedIssue
              ]}
              onPress={() => setIssue(issueType)}
            >
              <Text style={[
                styles.issueButtonText,
                issue === issueType && styles.selectedIssueText
              ]}>
                {issueType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Describe your issue</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          value={description}
          onChangeText={setDescription}
          placeholder="Please provide details about your issue..."
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Send size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Submit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detail: {
    fontSize: 16,
    color: '#666',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
  },
  issueButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  issueButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedIssue: {
    backgroundColor: '#084843',
  },
  issueButtonText: {
    color: '#666',
  },
  selectedIssueText: {
    color: '#FFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#084843',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default DisputeResolutionScreen;