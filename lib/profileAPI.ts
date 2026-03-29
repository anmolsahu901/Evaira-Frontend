import { UserProfile } from '../context/UserProfileContext';

const BASE_URL = 'http://192.168.1.7:8080'; // Update with your backend URL

export const submitUserProfile = async (
  profile: UserProfile
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!profile.authToken) {
      return {
        success: false,
        message: 'Authentication token is required',
      };
    }

    const payload = {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      location: profile.location,
      bodyType: profile.bodyType,
      faceShape: profile.faceShape,
      styleVibe: profile.styleVibe,
      preferredOccasions: profile.preferredOccasions,
      favoriteColors: profile.favoriteColors,
      priceBucket: profile.priceBucket,
    };

    console.log('Submitting profile:', payload);

    const response = await fetch(`${BASE_URL}/api/profile/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: profile.authToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      } catch (parseError) {
        // Backend returned non-JSON response
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // Success but response is not valid JSON
      console.warn('Backend returned non-JSON response but status was ok');
      return {
        success: true,
        message: 'Profile submitted successfully',
      };
    }
    
    return {
      success: true,
      message: data.message || 'Profile submitted successfully',
    };
  } catch (error) {
    console.error('Error submitting profile:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit profile',
    };
  }
};
