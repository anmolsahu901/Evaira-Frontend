import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter } from 'expo-router';
import { uploadPushToken } from '../lib/api';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Type definition for Subscription to satisfy TypeScript compiler
type NotificationSubscription = {
  remove: () => void;
};

// Conditionally require expo-notifications only when running in a custom dev-client or production build
const Notifications = !isExpoGo ? require('expo-notifications') : null;

if (Notifications) {
  // Configure foreground notifications behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function useNotifications(authToken: string | null) {
  const notificationListener = useRef<NotificationSubscription | null>(null);
  const responseListener = useRef<NotificationSubscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authToken || isExpoGo) {
      if (isExpoGo) {
        console.log('[notifications] Remote notifications are not supported in Expo Go. Use a development build to test remote notifications.');
      }
      return;
    }

    // 1. Get and register push token
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        uploadPushToken(token)
          .then(res => {
            if (res.ok) {
              console.log('[notifications] Push token saved to database successfully');
            } else {
              console.warn('[notifications] Failed to save push token to database:', res.status);
            }
          })
          .catch(err => {
            console.error('[notifications] Error uploading push token:', err);
          });
      }
    });

    // 2. Notification received in foreground listener
    if (Notifications) {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
        console.log('[notifications] Foreground notification received:', notification);
      });

      // 3. User tapped on notification listener
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
        const data = response.notification.request.content.data;
        console.log('[notifications] Notification tapped with data:', data);

        // Route directly to the Discover tab when clicked
        router.push('/(tabs)/discover');
      });
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [authToken]);
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (!Notifications) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('[notifications] Push permissions not granted');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('[notifications] Expo Push Token fetched:', token);
    } catch (e) {
      console.error('[notifications] Failed to fetch Expo push token:', e);
    }
  } else {
    console.log('[notifications] Device must be a physical device for push tokens');
  }

  return token;
}
