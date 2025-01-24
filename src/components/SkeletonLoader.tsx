import React from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

export const SkeletonLoader = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return <Animated.View style={[styles.skeleton, style, { opacity }]} />;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
});