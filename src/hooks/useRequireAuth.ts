import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from 'react-native';

export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && !user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to continue',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    }
  }, [user, loading]);

  return { user, loading };
};
