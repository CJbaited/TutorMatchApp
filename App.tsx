import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ChatProvider } from './src/context/ChatContext';

export default function App() {
  return (
    <ChatProvider>
      <NavigationContainer>
        <AppNavigator initialRouteName="DevHome" />
      </NavigationContainer>
    </ChatProvider>
  );
}
