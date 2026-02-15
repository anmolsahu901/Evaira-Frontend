import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';
import { useUserProfile } from '../context/UserProfileContext';
import { validateToken } from '../lib/api';

export default function SplashScreen() {
  const router = useRouter();
  const { setAuthToken } = useUserProfile();

  useEffect(() => {
    const checkPersistentAuth = async () => {
      try {
        // ===== PERSISTENT AUTH CHECK - START =====
        // This functionality allows users to stay logged in between app sessions
        // To disable this (e.g., for UI updates or testing), comment out lines marked with [PERSIST_AUTH]
        
        const token = await SecureStore.getItemAsync('authToken'); // [PERSIST_AUTH]
        
        if (token) { // [PERSIST_AUTH]
          // Token found → User was previously logged in
          // Now validate if the token is still valid (not expired)
          console.log('Token found. Validating token...');
          const isTokenValid = await validateToken();
          
          if (isTokenValid) {
            // ✅ Token is valid
            setAuthToken(token); // [PERSIST_AUTH]
            console.log('Token validation successful. Navigating to home.');
            router.replace('/(tabs)/home'); // [PERSIST_AUTH]
          } else {
            // ❌ Token is expired (401) - clear it and send to login
            console.warn('Token has expired. Clearing token and redirecting to login.');
            await SecureStore.deleteItemAsync('authToken');
            router.replace('/login'); // [PERSIST_AUTH]
          }
        } else { // [PERSIST_AUTH]
          // No token → User needs to login
          console.log('No token found. Redirecting to login.');
          router.replace('/login'); // [PERSIST_AUTH]
        } // [PERSIST_AUTH]
        
        // ===== PERSISTENT AUTH CHECK - END =====
      } catch (error) {
        console.error('Error checking persistent auth:', error);
        // On error, default to login screen for safety
        router.replace('/login');
      }
    };

    // Call auth check after splash animation delay (3 seconds)
    const timer = setTimeout(checkPersistentAuth, 3000);

    return () => clearTimeout(timer);
  }, [router, setAuthToken]);

  return (

    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}></ThemedText>
      </View>
      <Image
        source={Images.logo}
        style={styles.icon}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  icon: {
    width: "100%",
    height: "100%",
    resizeMode: 'contain',
  },
  header: {
      position: 'absolute',
      top: 36,
      width: '100%',
      alignItems: 'center',
    },
    headerText: {
      fontSize: 36,
      color: '#111',
    },
});
