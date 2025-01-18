import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type RegistrationCompleteScreenRouteProp = RouteProp<RootStackParamList, 'RegistrationComplete'>;

const RegistrationCompleteScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RegistrationCompleteScreenRouteProp>();
  const { role } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Home', { role });
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, [navigation, role]);

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.title}>Registration Complete</Text>
      
    </Animatable.View>
  );
};
//<Image source={require('../../assets/3d-graphic.png')} style={styles.image} />
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default RegistrationCompleteScreen;