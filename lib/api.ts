// app/lib/api.ts
import * as SecureStore from 'expo-secure-store';
import { useUserProfile } from '../context/UserProfileContext';

export type SendLikePayload = {
  productId: number | string;
  actionType: 'LIKE' | 'UNLIKE' | 'SAVE' | 'OPEN' | 'SHARE' | 'DISLIKE';
};

export type ApiResult = {
  ok: boolean;
  status?: number;
  data?: any;
};

const API_URL = 'https://example.com/api/likes'; // ← Replace with your real endpoint
const SEND_OTP_URL = 'http://192.168.1.12:8080/api/auth/send-otp';
const VERIFY_OTP_URL = 'http://192.168.1.12:8080/api/auth/verify-otp';
const PROFILE_CREATE_URL = 'http://192.168.1.12:8080/api/profile/create';
const GET_PRODUCTS_URL = 'http://192.168.1.12:8080/api/user/products/getAllProducts';
const ACTIONS_URL = 'http://192.168.1.12:8080/api/actions'; // Like/Unlike endpoint

// Development mock toggle:
// - By default, mocks are enabled in dev (__DEV__)
// - Set `global.__FORCE_API_CALL__ = true` (in dev console or at app startup) to force real network requests
const USE_DEV_MOCKS = typeof __DEV__ !== 'undefined' && __DEV__;
function isForceApiCall() {
  return (global as any).__FORCE_API_CALL__ === true;
}

// ✅ NEW: Helper to get auth token from secure storage
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
}

// ✅ NEW: Generic authenticated API wrapper
// Automatically includes Authorization header and handles 401 responses
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<ApiResult> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.warn('No auth token found. User may need to re-login.');
      return { ok: false, status: 401, data: { error: 'No auth token' } };
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': token, // Add token to every authenticated request
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // ✅ Handle 401: Token expired or user deleted
    if (response.status === 401) {
      console.error('❌ Unauthorized (401) - Token expired or user deleted');
      // Clear stored token
      try {
        await SecureStore.deleteItemAsync('authToken');
      } catch (e) {
        console.error('Error clearing token:', e);
      }
      return { ok: false, status: 401, data: { error: 'Unauthorized - please login again' } };
    }

    const data = await response.json().catch(() => undefined);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('authenticatedFetch error:', error);
    return { ok: false, data: { error: error } };
  }
}

// Development mock toggle:


export async function sendLikeNotification(payload: SendLikePayload): Promise<ApiResult> {
  const force = isForceApiCall();
  // Dev-mode mock to avoid failing in local dev
  if (USE_DEV_MOCKS && !force) {
    console.log('[api] sendLikeNotification: using dev mock');
    await new Promise(res => setTimeout(res, 300)); // simulate latency
    return { ok: true, status: 200 };
  }

  console.log('[api] sendLikeNotification: performing real request', { force, payload });
  
  // Use authenticatedFetch with JWT token
  return authenticatedFetch(ACTIONS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ✅ Helper functions for specific actions
export async function likeProduct(productId: number | string): Promise<ApiResult> {
  return sendLikeNotification({ productId, actionType: 'LIKE' });
}

export async function unlikeProduct(productId: number | string): Promise<ApiResult> {
  return sendLikeNotification({ productId, actionType: 'UNLIKE' });
}

export async function saveProduct(productId: number | string): Promise<ApiResult> {
  return sendLikeNotification({ productId, actionType: 'SAVE' });
}

export async function openProduct(productId: number | string): Promise<ApiResult> {
  return sendLikeNotification({ productId, actionType: 'OPEN' });
}

export async function shareProduct(productId: number | string): Promise<ApiResult> {
  return sendLikeNotification({ productId, actionType: 'SHARE' });
}

export async function dislikeProduct(productId: number | string): Promise<ApiResult> {
  return sendLikeNotification({ productId, actionType: 'DISLIKE' });
}

export async function sendOtp(email: string): Promise<ApiResult> {
  // Dev-mode mock
  const force = isForceApiCall();
  if (USE_DEV_MOCKS && !force) {
    console.log('[api] sendOtp: using dev mock');
    await new Promise(res => setTimeout(res, 300));
    return { ok: true, status: 200 };
  }

  console.log('[api] sendOtp ->', SEND_OTP_URL, { email, force });
  try {
    const res = await fetch(SEND_OTP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => undefined);
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error('sendOtp failed', error);
    return { ok: false };
  }
}

export async function verifyOtp(email: string, otp: string): Promise<ApiResult> {
  // Dev-mode mock
  const force = isForceApiCall();
  if (USE_DEV_MOCKS && !force) {
    console.log('[api] verifyOtp: using dev mock');
    await new Promise(res => setTimeout(res, 300));
    // Return an AuthResponse-like payload for development
    // If email includes 'new' treat it as a new user
    const isNew = String(email).toLowerCase().includes('new');
    return {
      ok: true,
      status: 200,
      data: {
        token: 'dev-token-123',
        isNew,
        userId: 123,
        email,
      },
    };
  }

  console.log('[api] verifyOtp ->', VERIFY_OTP_URL, { email, otp, force });
  try {
    const res = await fetch(VERIFY_OTP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json().catch(() => undefined);
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error('verifyOtp failed', error);
    return { ok: false };
  }
}

// ✅ NEW: Example authenticated API call
// Use this pattern for any endpoint requiring JWT authentication
export async function createUserProfile(profileData: any): Promise<ApiResult> {
  return authenticatedFetch(PROFILE_CREATE_URL, {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}

// ✅ NEW: Validate token by making a simple API call
// Returns true if token is valid (not expired)
// Returns false if token is expired (401) or invalid
export async function validateToken(): Promise<boolean> {
  const result = await authenticatedFetch(GET_PRODUCTS_URL, {
    method: 'GET',
  });

  // If 401: token is expired or invalid
  if (result.status === 401) {
    console.warn('Token validation failed: 401 Unauthorized (token expired)');
    return false;
  }

  // If successful: token is valid
  if (result.ok) {
    console.log('Token validation successful: token is valid');
    return true;
  }

  // Other errors (network, 500, etc.) - assume token might still be valid
  console.warn('Token validation inconclusive:', result.status);
  return true; // Optimistic: let app try to proceed
}

// ✅ NEW: Fetch products with JWT authentication
// Maps API response to frontend Product interface
export async function getProducts(): Promise<ApiResult> {
  const result = await authenticatedFetch(GET_PRODUCTS_URL, {
    method: 'GET',
  });

  if (result.ok && result.data && Array.isArray(result.data)) {
    // Map API response to Product interface
    const mappedProducts = result.data.map((apiProduct: any) => ({
      id: String(apiProduct.id),
      name: apiProduct.title || 'Unknown Product',
      price: `₹${apiProduct.price || 0}`,
      description: apiProduct.description || '',
      imageUrl: apiProduct.imageUrl || '',
      likes: apiProduct.likesCount || 0,
      shares: '0',
      bookmarks: '0',
      deeplinkUrl: apiProduct.deeplinkUrl || '', // Include deeplink from API
    }));
    return { ok: true, status: result.status, data: mappedProducts };
  }

  return result;
}