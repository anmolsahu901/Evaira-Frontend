import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';
import { sendOtp, verifyOtp } from '../lib/api';
import { useUserProfile } from '../context/UserProfileContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const router = useRouter();
  const { setUserId, setEmail: setProfileEmail } = useUserProfile();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      alert('Please enter a valid email');
      return;
    }

    setSending(true);
    try {
      const res = await sendOtp(email);
      if (res.ok) {
        setOtpSent(true);
        setMessage('OTP sent to your email');
        setMessageType('success');
      } else {
        setMessage('Failed to send OTP. Please try again.');
        setMessageType('error');
      }
    } catch (e) {
      console.error(e);
      setMessage('Failed to send OTP');
      setMessageType('error');
    } finally {
      setSending(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      alert('Please enter your email to resend OTP');
      return;
    }
    setResending(true);
    try {
      const res = await sendOtp(email);
      if (res.ok) {
        setMessage('OTP resent');
        setMessageType('success');
      } else {
        setMessage('Failed to resend OTP');
        setMessageType('error');
      }
    } catch (e) {
      console.error(e);
      setMessage('Failed to resend OTP');
      setMessageType('error');
    } finally {
      setResending(false);
    }
  };

  const handleContinue = async () => {
    if (!otpSent) {
      setMessage('Please request an OTP first');
      setMessageType('error');
      return;
    }
    if (!otp.trim()) {
      setMessage('Please enter the OTP');
      setMessageType('error');
      return;
    }

    setVerifying(true);
    try {
      const res = await verifyOtp(email, otp);
      if (res.ok) {
        // If backend returns auth payload, use it
        const auth = res.data;
        const token = auth?.token;
        const isNew = !!auth?.isNew;
        const userId = auth?.userId ?? null;
        const userEmail = auth?.email ?? null;

        try {
          if (token && typeof SecureStore?.setItemAsync === 'function') {
            await SecureStore.setItemAsync('authToken', String(token));
          }
        } catch (sErr) {
          console.warn('Could not store token', sErr);
        }

        // Save user id and email in context for later use
        try {
          if (userId != null) setUserId(Number(userId));
          if (userEmail != null) setProfileEmail(String(userEmail));
        } catch (ctxErr) {
          console.warn('Could not set user profile in context', ctxErr);
        }

        setMessage('');
        setMessageType(null);

        if (isNew) {
          // New user: go to profile creation
          router.push('/createProfile' as any);
        } else {
          // Existing user: go to home
          router.replace('/(tabs)/home');
        }
      } else {
        setMessage('Invalid OTP. Please try again.');
        setMessageType('error');
      }
    } catch (e) {
      console.error(e);
      setMessage('Error verifying OTP');
      setMessageType('error');
    } finally {
      setVerifying(false);
    }
  };

  const handleSignUp = () => {
    router.push('/createProfile' as any);
  }; 

  return (
    <ThemedView style={styles.container} >
      <View style={styles.topBar}>
        <ThemedText style={styles.topBarText}>Evaira</ThemedText>
      </View>

      <Image source={Images.logo} style={styles.logo} />

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (otpSent) {
            setOtpSent(false);
            setMessage('');
            setMessageType(null);
            setOtp('');
          }
        }}
      />

      {message ? (
        <ThemedText style={[styles.messageText, messageType === 'error' ? styles.messageError : styles.messageSuccess]}>
          {message}
        </ThemedText>
      ) : null}

      {!otpSent && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendOtp}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Send OTP</ThemedText>
          )}
        </TouchableOpacity>
      )} 

      {otpSent && (
        <>
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
            disabled={verifying}
          >
            {verifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Continue</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResendOtp} style={styles.resendWrapper}>
            <ThemedText style={styles.resendText}>{resending ? 'Resending...' : 'Resend OTP'}</ThemedText>
          </TouchableOpacity>
        </>
      )}


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
  messageText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  messageSuccess: {
    color: 'green',
  },
  messageError: {
    color: 'red',
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