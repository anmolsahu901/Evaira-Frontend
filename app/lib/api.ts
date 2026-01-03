export type SendLikePayload = {
  productId: string;
  liked: boolean;
};

export type ApiResponse = {
  ok: boolean;
  status?: number;
  data?: any;
};

/**
 * Sends a like/unlike notification to the server.
 * This is a lightweight stub — replace with real network code.
 */
export async function sendLikeNotification(payload: SendLikePayload): Promise<ApiResponse> {
  // Example: use fetch to call your backend
  // return fetch('/api/likes', { method: 'POST', body: JSON.stringify(payload) })
  //   .then(res => ({ ok: res.ok, status: res.status }))

  // Temporary simulated response for local development
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true, status: 200 };
}
