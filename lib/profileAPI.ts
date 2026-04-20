import { UserProfile } from '../context/UserProfileContext';

const BASE_URL = 'https://evaira-backend.onrender.com'; // Update with your backend URL

export const fetchUserProfile = async (authToken: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/profile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching profile:', error);
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
