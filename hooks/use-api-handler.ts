import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useUserProfile } from '../context/UserProfileContext';

/**
 * Custom hook for handling API errors globally
 * Automatically handles 401 (Unauthorized) responses by:
 * 1. Clearing the auth token
 * 2. Resetting user profile
 * 3. Redirecting to login
 */
export function useApiHandler() {
  const router = useRouter();
  const { resetProfile } = useUserProfile();

  const handleError = async (status?: number, error?: any) => {
    // Handle 401: Unauthorized (token expired or user deleted)
    if (status === 401) {
      console.error('❌ Unauthorized (401) - Logging out user');
      
      // Reset profile context
      resetProfile();
      
      // Show alert to user
      Alert.alert(
        'Session Expired',
        'Your login session has expired. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Redirect to login
              router.replace('/login');
            },
          },
        ]
      );
      return;
    }

    // Handle other server errors
    if (status && status >= 500) {
      Alert.alert(
        'Server Error',
        'A server error occurred. Please try again later.'
      );
      return;
    }

    // Handle network errors
    if (!status) {
      Alert.alert(
        'Network Error',
        'Unable to connect. Please check your internet connection.'
      );
      return;
    }
  };

  return { handleError };
}
