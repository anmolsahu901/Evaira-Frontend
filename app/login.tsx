import { useRouter } from 'expo-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ActivityIndicator, Image, StyleSheet, TextInput, TouchableOpacity, View, ScrollView, BackHandler, ToastAndroid, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';
import { sendOtp, verifyOtp } from '../lib/api';
import { fetchUserProfile } from '../lib/profileAPI';
import { useUserProfile } from '../context/UserProfileContext';
import { supabase } from '../config/supabase';

WebBrowser.maybeCompleteAuthSession();

// Track if the initial deep link launch URL has already been processed to prevent re-processing it on mount after logout
let initialUrlProcessed = false;

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
  const { setAuthToken } = useUserProfile();
  const backPressCount = useRef(0);

  // Listen for incoming deep links (handles Android redirects beautifully!)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Incoming deep link captured:', event.url);
      
      // Parse query params or fragment
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      const parsed = Linking.parse(event.url);
      accessToken = (parsed.queryParams?.access_token as string) || null;
      refreshToken = (parsed.queryParams?.refresh_token as string) || null;

      if (!accessToken && event.url.includes('#')) {
        const hash = event.url.split('#')[1];
        const params = new URLSearchParams(hash);
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
      }

      if (!accessToken && event.url.includes('#')) {
        const hashIndex = event.url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = event.url.substring(hashIndex + 1);
          const params = hash.split('&').reduce((acc, pair) => {
            const [key, value] = pair.split('=');
            if (key && value) {
              acc[key] = decodeURIComponent(value);
            }
            return acc;
          }, {} as Record<string, string>);
          accessToken = params.access_token || null;
          refreshToken = params.refresh_token || null;
        }
      }

      if (accessToken && refreshToken) {
        console.log('Tokens successfully extracted from deep link!');
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        
        console.log('Setting session on Supabase client...');
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session on Supabase:', sessionError);
            Alert.alert('Login Error', sessionError.message || 'Failed to establish Supabase session');
            return;
          }

          const token = sessionData?.session?.access_token;
          if (token) {
            console.log('Session established! Saving token to SecureStore:', token);
            await SecureStore.setItemAsync('authToken', token);
            setAuthToken(token);

            console.log('Checking profile setup for user...');
            const profileRes = await fetchUserProfile(token);
            const isNew = !profileRes.success || !profileRes.data || !profileRes.data.styleVibes;
            console.log('User profile setup status:', isNew ? 'NEW USER' : 'EXISTING USER');

            if (isNew) {
              await SecureStore.deleteItemAsync('hasSeenOnboarding').catch(() => {});
              router.replace('/profileSetup-1styleVibe' as any);
            } else {
              router.replace('/(tabs)/home' as any);
            }
          }
        } catch (err: any) {
          console.error('Error handling deep link session:', err);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Also check if the app was launched from a deep link (cold start)
    Linking.getInitialURL().then((url) => {
      if (url && !initialUrlProcessed) {
        initialUrlProcessed = true;
        console.log('App launched with initial URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle back press - require double press to exit
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (backPressCount.current === 0) {
          backPressCount.current += 1;
          if (Platform.OS === 'android') {
            ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          } else {
            Alert.alert('Exit App', 'Press back again to exit', [{ text: 'OK' }]);
          }
          setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [])
  );

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

    console.log(`Attempting to verify OTP for email: ${email} with OTP: ${otp}`);
    setVerifying(true);
    try {
      const res = await verifyOtp(email, otp);
      if (res.ok) {
        // If backend returns auth payload, use it
        const auth = res.data;
        console.log('verifyOtp response', res);
        console.log('auth payload:', auth);

        const token = auth?.token;
        // Backend might name the new-user flag `isNew` or `isNewUser` (or other variants).
        // Accept boolean/string/number representations to be robust against backend typing.
        const rawIsNew = auth?.isNew ?? auth?.isNewUser ?? auth?.newUser ?? null;
        if (rawIsNew == null) console.warn('verifyOtp: no new-user flag in auth payload, available keys:', Object.keys(auth || {}));
        const isNew = rawIsNew === true || rawIsNew === 'true' || rawIsNew === 1 || rawIsNew === '1';
        const userId = auth?.userId ?? null;
        const userEmail = auth?.email ?? null;

        try {
          if (token && typeof SecureStore?.setItemAsync === 'function') {
            await SecureStore.setItemAsync('authToken', String(token));
            await SecureStore.deleteItemAsync('hasSeenOnboarding');
          }
          // Also store token in context so downstream screens can use it
          if (token) setAuthToken(String(token));
        } catch (sErr) {
          console.warn('Could not store token', sErr);
        }

        // Save user id and email in context for later use
        // try {
        //   if (userId != null) setUserId(Number(userId));
        //   if (userEmail != null) setProfileEmail(String(userEmail));
        // } catch (ctxErr) {
        //   console.warn('Could not set user profile in context', ctxErr);
        // }

        setMessage('');
        setMessageType(null);

        if (isNew) {
          // New user: go to profile creation (use replace so user can't go back to login)
          router.replace('/profileSetup-1styleVibe' as any);
        } else {
          // Existing user: go to home
          router.replace('/(tabs)/home' as any);
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

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = Linking.createURL('/');
      console.log('Google OAuth redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      console.log('signInWithOAuth response:', data);

      if (error) {
        console.error('Supabase OAuth error:', error);
        Alert.alert('Login Error', error.message || 'Supabase OAuth failed');
        return;
      }

      if (data?.url) {
        console.log('Opening browser for Google OAuth flow:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === 'success' && result.url) {
          console.log('WebBrowser redirect successful, URL:', result.url);
          
          // Parse fragment/hash parameters first, falling back to query parameters
          let accessToken: string | null = null;
          let refreshToken: string | null = null;

          const parsed = Linking.parse(result.url);
          accessToken = (parsed.queryParams?.access_token as string) || null;
          refreshToken = (parsed.queryParams?.refresh_token as string) || null;

          if (!accessToken && result.url.includes('#')) {
            const hash = result.url.split('#')[1];
            const params = new URLSearchParams(hash);
            accessToken = params.get('access_token');
            refreshToken = params.get('refresh_token');
          }

          if (!accessToken && result.url.includes('#')) {
            // Fallback parsing of fragment
            const hashIndex = result.url.indexOf('#');
            if (hashIndex !== -1) {
              const hash = result.url.substring(hashIndex + 1);
              const params = hash.split('&').reduce((acc, pair) => {
                const [key, value] = pair.split('=');
                if (key && value) {
                  acc[key] = decodeURIComponent(value);
                }
                return acc;
              }, {} as Record<string, string>);
              accessToken = params.access_token || null;
              refreshToken = params.refresh_token || null;
            }
          }

          if (accessToken && refreshToken) {
            console.log('Tokens extracted from redirect URL. Setting session on Supabase client...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Error setting session on Supabase:', sessionError);
              Alert.alert('Login Error', sessionError.message || 'Failed to establish Supabase session');
              return;
            }

            const token = sessionData?.session?.access_token;
            if (token) {
              console.log('Session established! Saving token:', token);
              await SecureStore.setItemAsync('authToken', token);
              setAuthToken(token);

              // Check if user already has a profile setup
              console.log('Checking profile setup for user...');
              const profileRes = await fetchUserProfile(token);
              const isNew = !profileRes.success || !profileRes.data || !profileRes.data.styleVibes;
              console.log('User profile setup status:', isNew ? 'NEW USER' : 'EXISTING USER');
 
              if (isNew) {
                await SecureStore.deleteItemAsync('hasSeenOnboarding').catch(() => {});
                router.replace('/profileSetup-1styleVibe' as any);
              } else {
                router.replace('/(tabs)/home' as any);
              }
            } else {
              console.error('No access token in Supabase session data');
              Alert.alert('Login Error', 'Access token could not be retrieved.');
            }
          } else {
            console.warn('Tokens could not be extracted from OAuth callback URL');
            Alert.alert('Login Error', 'Failed to retrieve authentication tokens from callback.');
          }
        } else {
          console.log('WebBrowser was closed or cancelled by user, result:', result);
        }
      } else {
        console.error('No OAuth URL returned from Supabase');
        Alert.alert('Login Error', 'Google OAuth URL could not be generated.');
      }
    } catch (err: any) {
      console.error('Google Sign In Catch Error:', err);
      Alert.alert('Login Error', err.message || 'An unexpected error occurred during Google sign in');
    }
  };

  const handleSignUp = () => {
    router.push('/createProfile' as any);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }} bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Main Content */}
        <View style={styles.contentWrapper}>

          {/* Lightning Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Image
                source={require('../assets/circle_icon.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>Your AI stylist is waiting.</ThemedText>
          <ThemedText style={styles.subtitle}>Sign in to see today's curated look.</ThemedText>

          {/* LOGIN CARD */}
          <View style={styles.loginCard}>

            {/* Email */}
            <View style={styles.formSection}>
              <ThemedText style={styles.label}>EMAIL ADDRESS</ThemedText>

              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={18} color="#777" />

                <TextInput
                  style={styles.inputField}
                  placeholder="name@example.com"
                  placeholderTextColor="#999"
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
              </View>
            </View>

            {/* Message */}
            {message ? (
              <ThemedText
                style={[
                  styles.messageText,
                  messageType === 'error'
                    ? styles.messageError
                    : styles.messageSuccess,
                ]}
              >
                {message}
              </ThemedText>
            ) : null}

            {/* OTP */}
            {otpSent && (
              <View style={styles.formSection}>
                <View style={styles.otpHeader}>
                  <ThemedText style={styles.label}>OTP</ThemedText>

                  <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
                    <ThemedText style={styles.resendText}>
                      {resending ? 'Resending...' : 'Resend?'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="lock-outline" size={18} color="#777" />

                  <TextInput
                    style={styles.inputField}
                    placeholder="OTP"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>
              </View>
            )}

            {/* Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (sending || verifying) && styles.buttonDisabled,
              ]}
              onPress={otpSent ? handleContinue : handleSendOtp}
              disabled={sending || verifying}
            >
              {sending || verifying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <ThemedText style={styles.primaryButtonText}>
                    {otpSent ? 'VERIFY OTP' : 'SEND OTP'}
                  </ThemedText>

                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>OR CONTINUE WITH</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            {/* Social */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="apple" size={22} color="#000" />
                <ThemedText style={styles.socialText}>Apple</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} onPress={signInWithGoogle}>
                <MaterialCommunityIcons name="google" size={22} color="#000" />
                <ThemedText style={styles.socialText}>Google</ThemedText>
              </TouchableOpacity>
            </View>

          </View>

        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
        

          <View style={styles.securityBar}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#000000" />
            <ThemedText style={styles.securityTextWhite}>
              Secure, encrypted login powered by Evaira AI
            </ThemedText>
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity>
              <ThemedText style={styles.footerLink}>Privacy Policy</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.footerDot}>•</ThemedText>

            <TouchableOpacity>
              <ThemedText style={styles.footerLink}>Terms of Service</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.footerDot}>•</ThemedText>

            <TouchableOpacity>
              <ThemedText style={styles.footerLink}>Support</ThemedText>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  contentWrapper: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },


  iconContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  iconImage: {
    width: 70,
    height: 70,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 40,
    // backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  messageText: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    marginTop: -8,
  },
  messageSuccess: {
    color: '#4CAF50',
  },
  messageError: {
    color: '#f44336',
  },
  resendContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 16,
    marginTop: -12,
  },
  resendText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dividerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  socialButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 4,
  },
  socialButtonText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  footerLink: {
    fontSize: 11,
    color: '#999',
  },
  footerDot: {
    fontSize: 11,
    color: '#999',
  },
  loginCard: {
    width: '100%',
    backgroundColor: '#f5f5f5ff',
    borderRadius: 20,
    padding: 20,
    marginTop: 5,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },

  inputField: {
    flex: 1,
    fontSize: 14,
  },

  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },



  socialText: {
    fontSize: 13,
    fontWeight: '500',
  },

  securityBar: {
    //marginTop: 10,        // pushes it slightly down
    paddingVertical: 8,
    paddingHorizontal: 10, // left & right spacing inside box
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f5f5f5ff', // or your gradient color
    alignSelf: 'center'
  },

  securityTextWhite: {
    fontSize: 13,
    color: '#000000ff',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
    gap: 12
  },
  bottomSection: {
    paddingBottom: 15,
    alignItems: 'center',
  },
});