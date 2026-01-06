import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';

import { useUserProfile } from '../context/UserProfileContext';

export default function CreateProfileScreen() {
  const [username, setUsername] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setBirthdate } = useUserProfile();

  const handleContinue = async () => {
    if (!username.trim()) {
      alert('Please enter your username');
      return;
    }

    if (!day || !month || !year) {
      alert('Please enter your birthday (day, month, year)');
      return;
    }

    // Basic numeric validation
    if (isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
      alert('Birthday fields must be numbers');
      return;
    }

    setLoading(true);
    try {
      // Save birthday to profile context (YYYY-MM-DD)
      const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setBirthdate(iso);

      // TODO: send profile to API
      await new Promise((r) => setTimeout(r, 400));
      // Navigate to additional profile details page
      router.push('/profileDetails');
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <ThemedView style={styles.container} backgroundImage={Images.background}>
      <View style={styles.topBar}>
        <ThemedText style={styles.topBarText}>Evaira</ThemedText>
      </View>

      <Image source={Images.logo} style={styles.logo} />

      <TextInput
        style={styles.usernameInput}
        placeholder="Your username"
        placeholderTextColor="#444"
        value={username}
        onChangeText={setUsername}
      />

      <View style={styles.birthdayWrapper}>
        <ThemedText style={styles.birthdayLabel}>Your birthday</ThemedText>

        <View style={styles.birthdayRow}>
          <TextInput
            style={styles.bdayInput}
            placeholder="Day"
            placeholderTextColor="#444"
            keyboardType="numeric"
            value={day}
            onChangeText={setDay}
            maxLength={2}
          />

          <TextInput
            style={styles.bdayInput}
            placeholder="Month"
            placeholderTextColor="#444"
            keyboardType="numeric"
            value={month}
            onChangeText={setMonth}
            maxLength={2}
          />

          <TextInput
            style={styles.bdayInput}
            placeholder="Year"
            placeholderTextColor="#444"
            keyboardType="numeric"
            value={year}
            onChangeText={setYear}
            maxLength={4}
          />
        </View>
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
