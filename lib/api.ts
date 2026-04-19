// app/lib/api.ts
import * as SecureStore from 'expo-secure-store';
import { useUserProfile } from '../context/UserProfileContext';

export type SendLikePayload = {
  productId: number | string;
  actionType: 'LIKE' | 'UNLIKE' | 'SAVE' | 'UNSAVE' | 'OPEN' | 'SHARE' | 'DISLIKE' | 'SEEN';
};

export type ApiResult = {
  ok: boolean;
  status?: number;
  data?: any;
};

const SEND_OTP_URL = 'http://192.168.1.7:8080/api/auth/send-otp';
const VERIFY_OTP_URL = 'http://192.168.1.7:8080/api/auth/verify-otp';
const PROFILE_CREATE_URL = 'http://192.168.1.7:8080/api/profile/create';
const GET_PRODUCTS_URL = 'http://192.168.1.7:8080/api/user/products/getHomeFeedProducts';
const ACTIONS_URL = 'http://192.168.1.7:8080/api/actions'; // Like/Unlike endpoint
const ACTIONS_BULK_URL = 'http://192.168.1.7:8080/api/actions/bulk/seen'; // Bulk actions endpoint
const WISHLIST_URL = 'http://192.168.1.7:8080/api/user/products/getWishlistData';
const RECENT_PRODUCTS_URL = 'http://192.168.1.7:8080/api/user/products/getProductBasedOnAction';
const VALIDATE_TOKEN_URL = 'http://192.168.1.7:8080/api/profile/tokenValidation';
const DISCOVER_URL = 'http://192.168.1.7:8080/api/discover/getData';
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
    // Return 0 status for network errors to distinguish from HTTP errors
    return { ok: false, status: 0, data: { error: error } };
  }
}

// Development mock toggle:


export async function sendLikeNotification(payload: SendLikePayload): Promise<ApiResult> {
  const force = isForceApiCall();
  // Dev-mode mock to avoid failing in local dev
  if (USE_DEV_MOCKS && !force) {
    console.log('[api] send Notification: using dev mock');
    await new Promise(res => setTimeout(res, 300)); // simulate latency
    return { ok: true, status: 200 };
  }

  console.log('[api] send Notification: performing real request', { force, payload });
  
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

export async function unsaveProduct(productId: number | string): Promise<ApiResult> {
  return sendLikeNotification({ productId, actionType: 'UNSAVE' });
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

// ✅ NEW: Batch SEEN products
let seenProductsQueue: Set<string | number> = new Set();
let seenBatchTimer: ReturnType<typeof setTimeout> | null = null;

export async function flushSeenProducts() {
  if (seenProductsQueue.size === 0) return;
  const ids = Array.from(seenProductsQueue);
  seenProductsQueue.clear();
  
  if (seenBatchTimer) {
    clearTimeout(seenBatchTimer);
    seenBatchTimer = null;
  }

  try {
    const force = isForceApiCall();
    if (USE_DEV_MOCKS && !force) {
      console.log('[api] flushSeenProducts: using dev mock', { actionType: 'SEEN', productIds: ids });
      return;
    }

    console.log('[api] flushSeenProducts: performing real request', { actionType: 'SEEN', productIds: ids });
    await authenticatedFetch(ACTIONS_BULK_URL, {
      method: 'POST',
      body: JSON.stringify({
        actionType: 'SEEN',
        productIds: ids,
      }),
    });
  } catch (e) {
    console.error('Failed to batch send SEEN actions', e);
  }
}

export function trackProductSeen(productId: string | number) {
  seenProductsQueue.add(productId);

  if (!seenBatchTimer) {
    seenBatchTimer = setTimeout(() => {
      flushSeenProducts();
    }, 15000); // 15 seconds
  }
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
  const result = await authenticatedFetch(VALIDATE_TOKEN_URL, {
    method: 'POST',
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

  // Network errors (status 0) or other failures: treat as validation failure
  // This ensures user is sent to login instead of being stuck with invalid auth
  console.warn('Token validation failed: Network error or server error (status:', result.status, ')');
  return false;
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
      brand: apiProduct.brand || apiProduct.category || undefined,
      category: apiProduct.category || undefined,
      externalId: apiProduct.externalId || undefined,
      rating: apiProduct.rating || undefined,
    }));
    return { ok: true, status: result.status, data: mappedProducts };
  }

  return result;
}

// ✅ NEW: Fetch wishlist data (SAVE or LIKE products)
// Returns a list of products that match the specified action type
// API accepts actionType in body: "SAVE" or "LIKE"
// Uses POST method to send request body with actionType
// Example: getWishlistData('LIKE') -> POST to /api/actions/getWishlistData with { "actionType": "LIKE" }
export async function getWishlistData(actionType: 'LIKE' | 'SAVE'): Promise<ApiResult> {
  try {
    const payload = { actionType };
    console.log('[api] getWishlistData: starting request', { payload });

    const result = await authenticatedFetch(WISHLIST_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('[api] getWishlistData: received response', { status: result.status, ok: result.ok });

    if (result.ok && result.data && Array.isArray(result.data)) {
      console.log(`[api] getWishlistData: successfully fetched ${result.data.length} products`, { actionType });
      return result;
    } else if (Array.isArray(result.data)) {
      // Empty array is valid - user has no items of this type
      console.log('[api] getWishlistData: received empty list', { actionType });
      return { ok: true, status: result.status, data: [] };
    } else {
      console.warn('[api] getWishlistData: invalid response format', { actionType, status: result.status, data: result.data });
      return { ok: false, status: result.status || 500, data: [] };
    }
  } catch (error) {
    console.error('[api] getWishlistData: error occurred', { actionType, error });
    return { ok: false, status: 0, data: [] };
  }
}

// ✅ NEW: Fetch products based on recent actions (SEEN, OPEN)
export async function getProductBasedOnAction(actionType: 'SEEN' | 'OPEN'): Promise<ApiResult> {
  try {
    const payload = { actionType };
    console.log('[api] getProductBasedOnAction: starting request', { payload });

    // Note: Using POST here because fetch() will throw an error if GET has a body.
    // If the backend strictly expects GET, the backend should be updated to use @PostMapping,
    // just like getWishlistData uses @PostMapping.
    const result = await authenticatedFetch(RECENT_PRODUCTS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('[api] getProductBasedOnAction: received response', { status: result.status, ok: result.ok });

    if (result.ok && result.data && Array.isArray(result.data)) {
      console.log(`[api] getProductBasedOnAction: successfully fetched ${result.data.length} products`, { actionType });
      return result;
    } else if (Array.isArray(result.data)) {
      return { ok: true, status: result.status, data: [] };
    } else {
      console.warn('[api] getProductBasedOnAction: invalid response format', { actionType, status: result.status, data: result.data });
      return { ok: false, status: result.status || 500, data: [] };
    }
  } catch (error) {
    console.error('[api] getProductBasedOnAction: error occurred', { actionType, error });
    return { ok: false, status: 0, data: [] };
  }
}

// ✅ Cache variables for Discover Data
let discoverCache: ApiResult | null = null;
let discoverPromise: Promise<ApiResult> | null = null;

// ✅ NEW: Prefetch Discover Screen Data
export async function prefetchDiscoverData(): Promise<ApiResult> {
  if (discoverPromise) return discoverPromise;
   console.log('the discover API is hit');
  discoverPromise = authenticatedFetch(DISCOVER_URL, {
    method: 'POST',
  }).then(result => {
    discoverCache = result;
    return result;
  });
  
  return discoverPromise;
}

// ✅ NEW: Fetch Discover Screen Data (with caching)
export async function getDiscoverData(forceRefresh = false): Promise<ApiResult> {
  if (forceRefresh) {
    discoverPromise = null;
    discoverCache = null;
  }
  
  if (discoverCache) return discoverCache;
  if (discoverPromise) return discoverPromise;
  
  return prefetchDiscoverData();
}