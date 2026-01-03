import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';

export default function CreateProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!username || !day || !month || !year) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate save/profile creation
      await new Promise((r) => setTimeout(r, 1000));
      router.replace('/(tabs)/home');
    } catch (err) {
      console.error(err);
      alert('Could not create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container} backgroundImage={Images.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.headerText}>Evaira</ThemedText>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.inner}
        >
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />

        <TextInput
          placeholder="Your username"
          placeholderTextColor="#666"
          style={styles.usernameInput}
          value={username}
          onChangeText={setUsername}
        />

        <ThemedText style={styles.label}>Your birthday</ThemedText>

        <View style={styles.birthdayRow}>
          <TextInput
            placeholder="Day"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            style={styles.smallInput}
            value={day}
            onChangeText={setDay}
            maxLength={2}
          />
          <TextInput
            placeholder="Month"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            style={styles.smallInput}
            value={month}
            onChangeText={setMonth}
            maxLength={2}
          />
          <TextInput
            placeholder="Year"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            style={styles.smallInput}
            value={year}
            onChangeText={setYear}
            maxLength={4}
          />
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.continueText}>Continue →</ThemedText>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  header: {
    width: '100%',
    backgroundColor: '#2d3638',
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  headerText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: 4,
  },
  inner: {
    width: '100%',
    alignItems: 'center',
    marginTop: 28,
  },
  logo: {
    width: 220,
    height: 64,
    marginBottom: 40,
    zIndex: 1,
  },
  usernameInput: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#222',
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    fontSize: 18,
    marginBottom: 30,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 12,
    marginBottom: 12,
    fontSize: 18,
    color: '#222',
  },
  birthdayRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  smallInput: {
    flex: 1,
    height: 52,
    marginHorizontal: 6,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#222',
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#2d3638',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
