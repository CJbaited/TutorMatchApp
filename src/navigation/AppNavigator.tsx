import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import NameInputScreen from '../screens/NameInputScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import SubjectSelectionScreen from '../screens/SubjectSelectionScreen';
import AreaSelectionScreen from '../screens/AreaSelectionScreen';
import FormatSelectionScreen from '../screens/FormatSelectionScreen';
import LocationSelectionScreen from '../screens/LocationSelectionScreen';
import FrequencySelectionScreen from '../screens/FrequencySelectionScreen';
import DurationSelectionScreen from '../screens/DurationSelectionScreen';
import RegistrationCompleteScreen from '../screens/RegistrationCompleteScreen';
import BottomTabNavigator from './BottomTabNavigator';
import TutorTabNavigator from './TutorTabNavigator';
import TutorProfileScreen from '../screens/TutorProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import TutorList from '../screens/TutorList';
import CategoryScreen from '../screens/CategoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import BookingCalendarScreen from '../screens/BookingCalendarScreen';
import PaymentScreen from '../screens/PaymentScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import BookingsScreen from '../screens/BookingsScreen';
import  supabase  from '../services/supabase';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    checkUserProfile();
  }, [user]);

  const checkUserProfile = async () => {
    if (!user) {
      setHasProfile(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      setHasProfile(!!profile);
    } catch (error) {
      console.error('Error checking profile:', error);
      setHasProfile(false);
    }
  };

  const handleRegistrationComplete = (role: string) => {
    navigation.reset({
      index: 0,
      routes: [{ 
        name: role === 'tutor' ? 'TutorTabs' : 'MainApp'
      }],
    });
  };

  if (loading || hasProfile === null) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      initialRouteName={user ? (hasProfile ? 'MainApp' : 'RoleSelection') : 'Welcome'}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ headerShown: false }} 
      />
      
      {/* Onboarding Screens */}
      <Stack.Screen name="NameInput" component={NameInputScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="RoleSelection" 
        component={RoleSelectionScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} />
      <Stack.Screen name="AreaSelection" component={AreaSelectionScreen} />
      <Stack.Screen name="FormatSelection" component={FormatSelectionScreen} />
      <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
      <Stack.Screen name="FrequencySelection" component={FrequencySelectionScreen} />
      <Stack.Screen name="DurationSelection" component={DurationSelectionScreen} />
      <Stack.Screen 
        name="RegistrationComplete" 
        component={RegistrationCompleteScreen} 
        options={{ headerShown: false }}
      />

      {/* Tutor Screens */}
      <Stack.Screen 
        name="TutorDashboard" 
        component={TutorTabNavigator} 
        options={{ headerShown: false }}
      />
      
      {/* Main App Screens */}
      <Stack.Screen 
        name="MainApp" 
        component={BottomTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="TutorProfile" component={TutorProfileScreen} options={{headerShown: false, presentation: 'modal'}}/>
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.name || 'Chat',
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen 
        name="TutorList" 
        component={TutorList}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShadowVisible: false,
          headerTitle: 'Settings',
          headerStyle: {
            backgroundColor: '#F8F9FA',
          }
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShadowVisible: false,
          headerTitle: 'Profile',
          headerStyle: {
            backgroundColor: '#F8F9FA',
          }
        }}
      />
      <Stack.Screen 
        name="Preferences" 
        component={PreferencesScreen}
        options={{
          headerTitle: 'My Preferences',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F8F9FA',
          },
        }}
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BookingCalendar" 
        component={BookingCalendarScreen}
        options={{ title: 'Select Time' }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
      <Stack.Screen 
        name="BookingConfirmation" 
        component={BookingConfirmationScreen}
        options={{ title: 'Confirm Booking' }}
      />
      <Stack.Screen 
        name="BookingSuccess" 
        component={BookingSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          headerTitle: 'My Bookings',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F8F9FA',
          }
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;