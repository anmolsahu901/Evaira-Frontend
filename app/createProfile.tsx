import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';

import { useUserProfile } from '../context/UserProfileContext';

export default function CreateProfileScreen() {
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setName, setAge } = useUserProfile();

  const handleContinue = async () => {
    if (!nameInput.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!ageInput.trim()) {
      alert('Please enter your age');
      return;
    }

    const age = parseInt(ageInput);
    if (isNaN(age) || age < 13 || age > 120) {
      alert('Please enter a valid age (13-120)');
      return;
    }

    setLoading(true);
    try {
      setName(nameInput.trim());
      setAge(age);

      await new Promise((r) => setTimeout(r, 400));
      router.push('/profileSetup-1styleVibe');
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <ThemedView style={styles.container} >
      <View style={styles.topBar}>
        <ThemedText style={styles.topBarText}>Evaira</ThemedText>
      </View>

      <Image source={Images.logo} style={styles.logo} />

      <TextInput
        style={styles.usernameInput}
        placeholder="Your full name"
        placeholderTextColor="#444"
        value={nameInput}
        onChangeText={setNameInput}
      />

      <View style={styles.birthdayWrapper}>
        <ThemedText style={styles.birthdayLabel}>Your age</ThemedText>
        <TextInput
          style={styles.bdayInput}
          placeholder="Age"
          placeholderTextColor="#444"
          keyboardType="numeric"
          value={ageInput}
          onChangeText={setAgeInput}
          maxLength={3}
        />
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading}>
        <View style={styles.continueContent}>
          <ThemedText style={styles.continueText}>Continue</ThemedText>
          {loading ? (
            <ActivityIndicator color="#fff" style={styles.spinner} />
          ) : (
            <ThemedText style={styles.arrow}>→</ThemedText>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipWrapper} onPress={() => router.replace('/(tabs)/home')}>
        <ThemedText style={styles.skipText}>Skip for now</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 70,
    marginTop: -70,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  usernameInput: {
    width: '86%',
    height: 64,
    borderWidth: 4,
    borderColor: '#111',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  birthdayWrapper: {
    width: '86%',
    marginTop: 8,
  },
  birthdayLabel: {
    fontSize: 18,
    color: '#111',
    marginBottom: 10,
  },
  birthdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bdayInput: {
    width: 96,
    height: 56,
    borderWidth: 4,
    borderColor: '#111',
    borderRadius: 12,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 16,
    justifyContent: 'center',
  },
  continueButton: {
    width: '80%',
    height: 64,
    backgroundColor: '#2b3133',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 20,
    marginRight: 10,
  },
  arrow: {
    color: '#fff',
    fontSize: 20,
  },
  spinner: {
    marginLeft: 8,
  },
  skipWrapper: {
    marginTop: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#111',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: -24,
    right: -24,
    height: 84,
    backgroundColor: '#263238',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingTop: 18,
  },
  topBarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
});
