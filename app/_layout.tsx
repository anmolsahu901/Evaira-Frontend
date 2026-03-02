import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProfileProvider } from '../context/UserProfileContext';
import { WishlistProvider } from '../context/WishlistContext';

// Force real API calls during development when needed. Set this to true to bypass dev mocks.
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  ;(global as any).__FORCE_API_CALL__ = true;
  console.log('[startup] __FORCE_API_CALL__ = true (dev)');
} 

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProfileProvider>
          <WishlistProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="splash" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </WishlistProvider>
        </UserProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}