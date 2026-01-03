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

export async function sendLikeNotification(payload: SendLikePayload): Promise<ApiResult> {
  // Dev-mode mock to avoid failing in local dev
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
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