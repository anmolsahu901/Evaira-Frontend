// app/lib/api.ts
export type SendLikePayload = {
  productId: string;
  liked: boolean;
};

export type ApiResult = {
  ok: boolean;
  status?: number;
  data?: any;
};

const API_URL = 'https://example.com/api/likes'; // ← Replace with your real endpoint
const SEND_OTP_URL = 'http://192.168.1.12/api/auth/send-otp';
const VERIFY_OTP_URL = 'http://192.168.1.12/api/auth/verify-otp';

// Development mock toggle:
// - By default, mocks are enabled in dev (__DEV__)
// - Set `global.__FORCE_API_CALL__ = true` (in dev console or at app startup) to force real network requests
const USE_DEV_MOCKS = typeof __DEV__ !== 'undefined' && __DEV__;
const FORCE_API_CALL = (global as any).__FORCE_API_CALL__ === true;

export async function sendLikeNotification(payload: SendLikePayload): Promise<ApiResult> {
  // Dev-mode mock to avoid failing in local dev
  if (USE_DEV_MOCKS && !FORCE_API_CALL) {
    await new Promise(res => setTimeout(res, 300)); // simulate latency
    return { ok: true, status: 200 };
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => undefined);
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error('sendLikeNotification failed', error);
    return { ok: false };
  }
}

export async function sendOtp(email: string): Promise<ApiResult> {
  // Dev-mode mock
  if (USE_DEV_MOCKS && !FORCE_API_CALL) {
    await new Promise(res => setTimeout(res, 300));
    return { ok: true, status: 200 };
  }

  try {
    console.log('[api] sendOtp ->', SEND_OTP_URL, { email });
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
  if (USE_DEV_MOCKS && !FORCE_API_CALL) {
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

  try {
    console.log('[api] verifyOtp ->', VERIFY_OTP_URL, { email, otp });
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