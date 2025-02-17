import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function setBadgeCountSafely(count: number) {
  // Remove this function since we're not using app badge counts
  return;
}

export async function setupNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false, // We don't want app badge counts
      }),
    });

    return true;
  } catch (error) {
    console.log('Error setting up notifications:', error);
    return false;
  }
}

export async function scheduleLocalNotification(
  title: string, 
  body: string,
  activeConversationId: string | null,
  messageConversationId: string
) {
  // Don't show notification if user is in the same conversation
  if (activeConversationId === messageConversationId) {
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}
