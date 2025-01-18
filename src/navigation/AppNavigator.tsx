import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import SubjectSelectionScreen from '../screens/SubjectSelectionScreen';
import AreaSelectionScreen from '../screens/AreaSelectionScreen';
import FormatSelectionScreen from '../screens/FormatSelectionScreen';
import LocationSelectionScreen from '../screens/LocationSelectionScreen';
import FrequencySelectionScreen from '../screens/FrequencySelectionScreen';
import DurationSelectionScreen from '../screens/DurationSelectionScreen';
import RegistrationCompleteScreen from '../screens/RegistrationCompleteScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = ({ initialRouteName = "Welcome" }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} />
      <Stack.Screen name="AreaSelection" component={AreaSelectionScreen} />
      <Stack.Screen name="FormatSelection" component={FormatSelectionScreen} />
      <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
      <Stack.Screen name="FrequencySelection" component={FrequencySelectionScreen} />
      <Stack.Screen name="DurationSelection" component={DurationSelectionScreen} />
      <Stack.Screen name="RegistrationComplete" component={RegistrationCompleteScreen} />
      <Stack.Screen name="Home" component={BottomTabNavigator} />
      {/* Direct route to HomeScreen for development */}
      <Stack.Screen
        name="DevHome"
        component={HomeScreen}
        initialParams={{ role: 'student' }}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;