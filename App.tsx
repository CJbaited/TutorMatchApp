import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { BookingProvider } from './src/contexts/BookingContext';
import { FAQProvider } from './src/contexts/FAQContext';
import { DrawerProvider } from './src/contexts/DrawerContext';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <DrawerProvider>
          <FAQProvider>
            <FavoritesProvider>
              <ChatProvider>
                <BookingProvider>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </BookingProvider>
              </ChatProvider>
            </FavoritesProvider>
          </FAQProvider>
        </DrawerProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
