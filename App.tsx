import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ChatProvider } from './src/context/ChatContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <FavoritesProvider>
        <ChatProvider>
          <NavigationContainer>
            <AppNavigator initialRouteName="DevHome" />
          </NavigationContainer>
        </ChatProvider>
      </FavoritesProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
