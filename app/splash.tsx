import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import { ThemedView } from '../components/themed-view';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 5000); // 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ThemedView style={styles.container} backgroundImage={require('@/assets/images/screenbg.png')}>
      <Image
        source={require('@/assets/images/screenbg.png')}
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
});
