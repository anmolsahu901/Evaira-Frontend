import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/createProfile' as any);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

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
