import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ChatProvider } from './src/context/ChatContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';

export default function App() {
  return (
    <FavoritesProvider>
      <ChatProvider>
        <NavigationContainer>
          <AppNavigator initialRouteName="DevHome" />
        </NavigationContainer>
      </ChatProvider>
    </FavoritesProvider>
  );
}
