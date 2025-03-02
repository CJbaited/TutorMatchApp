import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep, totalSteps }) => {
  // Create an array of steps for rendering
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {steps.map((step) => (
          <React.Fragment key={step}>
            <View 
              style={[
                styles.progressDot, 
                currentStep >= step ? styles.progressDotActive : null
              ]} 
            />
            {step < totalSteps && (
              <View 
                style={[
                  styles.progressLine, 
                  currentStep > step ? styles.progressLineActive : null
                ]} 
              />
            )}
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#084843',
  },
  progressLine: {
    height: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  progressLineActive: {
    backgroundColor: '#084843',
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});

export default OnboardingProgress;