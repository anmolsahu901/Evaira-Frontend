import { UserProfile } from '../context/UserProfileContext';

const BASE_URL = 'http://192.168.1.5:8080'; // Update with your backend URL

export const fetchUserProfile = async (authToken: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/profile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Expected case for new or deleted users
        return { success: false, data: null };
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn('Info: Profile fetch skipped or returned non-OK status:', error instanceof Error ? error.message : error);
    return { success: false, data: null };
  }
};

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
      styleVibes: profile.styleVibes,
      fitTypes: profile.fitTypes,
      preferredOccasions: profile.preferredOccasions,
      favoriteColors: profile.favoriteColors,
      priceBucket: profile.priceBucket,
    };

    console.log('Submitting profile payload:', JSON.stringify(payload, null, 2));
    console.log('Price bucket value:', profile.priceBucket, typeof profile.priceBucket);

    const response = await fetch(`${BASE_URL}/api/profile/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: profile.authToken.startsWith('Bearer ') ? profile.authToken : `Bearer ${profile.authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || `HTTP ${response.status}`);
      } catch (parseError) {
        // Backend returned non-JSON response (e.g. Spring Boot HTML stack trace)
        const cleanMsg = text.length > 200 ? text.substring(0, 200) + '...' : text;
        throw new Error(`HTTP ${response.status}: ${cleanMsg || 'Server Error'}`);
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
