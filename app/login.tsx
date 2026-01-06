import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';

export default function LoginScreen() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!phoneOrEmail) {
      alert('Please enter phone number or email');
      return;
    }
    if (!otp) {
      alert('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with real verification logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/(tabs)/home');
    } catch (error) {
      alert('Error during verification. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      // TODO: Trigger OTP resend via API
      await new Promise(resolve => setTimeout(resolve, 800));
      alert('OTP resent');
    } catch (e) {
      alert('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleSignUp = () => {
    router.push('/createProfile' as any);
  };

  return (
    <ThemedView style={styles.container} backgroundImage={Images.background}>
      <Image source={Images.logo} style={styles.logo} />

      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number or Email"
        placeholderTextColor="#666"
        keyboardType="default"
        value={phoneOrEmail}
        onChangeText={setPhoneOrEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Continue</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOtp} style={styles.resendWrapper}>
        <ThemedText style={styles.resendText}>{resending ? 'Resending...' : 'Resend OTP'}</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSignUp} style={styles.signUpWrapper}>
        <ThemedText style={styles.signUpText}>Don't have an account? Sign Up</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  input: {
    width: '90%',
    height: 64,
    borderWidth: 4,
    borderColor: '#111',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  button: {
    width: '80%',
    height: 64,
    backgroundColor: '#2b3133',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  resendWrapper: {
    marginTop: 8,
    marginBottom: 18,
  },
  resendText: {
    fontSize: 16,
    color: '#111',
  },
  signUpWrapper: {
    marginTop: 8,
  },
  signUpText: {
    fontSize: 16,
    color: '#111',
  },
});