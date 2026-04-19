import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Pressable } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';
import { useUserProfile } from '../context/UserProfileContext';
import { validateToken, prefetchHomeData } from '../lib/api';

export default function SplashScreen() {
  const router = useRouter();
  const { setAuthToken } = useUserProfile();

  
  // Animation values
  // const opacity = useSharedValue(0);
  const isInitialLoad = useRef(true);
  const authCheckDone = useRef(false);

  // Fade in animation
  const opacity = useSharedValue(1);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = 0;

    opacity.value = withDelay(
      1000,
      withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      })
    );
  }, []);

  const handleGetStarted = () => {
    // router.push('/login');

    router.push('/login'); // Temporary: auto-navigate to login for development/testing. Remove this line to enable splash screen and auth check.



  };


  useEffect(() => {
    const checkPersistentAuth = async () => {
      if (authCheckDone.current) return;
      authCheckDone.current = true;

      try {
        // ===== PERSISTENT AUTH CHECK - START =====
        // This functionality allows users to stay logged in between app sessions
        // To disable this (e.g., for UI updates or testing), comment out lines marked with [PERSIST_AUTH]

        const token = await SecureStore.getItemAsync('authToken'); // [PERSIST_AUTH]

        if (token) { // [PERSIST_AUTH]
          // Token found → User was previously logged in
          // Now validate if the token is still valid (not expired)
          console.log('Token found. Validating token... Token is:', token);
          const isTokenValid = await validateToken();

          if (isTokenValid) {
            // ✅ Token is valid
            setAuthToken(token); // [PERSIST_AUTH]

            console.log('✅ Token validation successful. Token is valid. Navigating to home.');
            
            // PREFETCH DATA EARLY! Start fetching Home data before navigating
            prefetchHomeData().catch(e => console.log('Prefetch home data failed', e));
            
            router.replace('/home'); // [PERSIST_AUTH]
          //  router.replace('/login'); // [chang
          // es for testing ]

          } else {
            // ❌ Token is expired (401) or validation failed - clear it and send to login
            console.warn('❌ Token validation failed. Clearing token and redirecting to login.');
            await SecureStore.deleteItemAsync('authToken');
           // router.replace('/login'); // [PERSIST_AUTH]
          }
        } else { // [PERSIST_AUTH]
          // No token → User needs to login
          console.log('No token found. Redirecting to login.');
          // router.replace('/login'); // [PERSIST_AUTH]
        } // [PERSIST_AUTH]

        // ===== PERSISTENT AUTH CHECK - END =====
      } catch (error) {
        console.error('Error checking persistent auth:', error);
        // On error, default to login screen for safety
      //  router.replace('/login');
      }
    };



    // For initial load, show the splash screen UI with button
    // Only auto-navigate if token exists and is valid
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      // Check auth after a brief delay to show the splash screen
      const timer = setTimeout(checkPersistentAuth, 1000);
      return () => clearTimeout(timer);
    }
  }, [router, setAuthToken]);

  return (
    <ThemedView style={styles.container}>
      {/* Icon with fade animation */}
      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <View style={styles.iconCircle}>
            <Image
              source={require('../assets/circle_icon.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Tagline */}
        <ThemedText style={styles.branding}>EVAIRA</ThemedText>
        <ThemedText style={styles.tagline}>STYLE, REIMAGINED.</ThemedText>

        {/* Divider line */}
        <View style={styles.divider} />
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* AI Powered text */}
        <ThemedText style={styles.aiText}>AI Powered Personal Styling</ThemedText>

        {/* Get Started Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={handleGetStarted}
        >
          <ThemedText style={styles.buttonText}>Get Started</ThemedText>
          <ThemedText style={styles.buttonArrow}> ›</ThemedText>
        </Pressable>

        {/* Premium Fashion label */}
        <ThemedText style={styles.premiumLabel}>⬥ PREMIUM FASHION ⬥</ThemedText>
      </View>
    </ThemedView>
  );
}

// Callback handler - engineer can implement this


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 25,
  },
  iconImage: {
    width: 90,
    height: 90,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightningIcon: {
    fontSize: 48,
    color: '#ffffff',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 2.5,
    marginBottom: 20,
  },
  branding: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1f26',
    marginBottom: 5,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: '#d0d0d0',
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 20,
    marginBottom: 38,
  },
  aiText: {
    fontSize: 12,
    color: '#b0b0b0',
    fontStyle: 'italic',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: '#1a1f26',
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonArrow: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  premiumLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 1.5,
  },
});
