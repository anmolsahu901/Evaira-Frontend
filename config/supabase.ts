import { createClient } from '@supabase/supabase-js';
import { ChunkedSecureStore } from '../lib/secureStore';
import { ENV } from './env';

// A secure storage adapter for Supabase that works on Expo using ChunkedSecureStore to bypass the 2048-byte limit
const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return ChunkedSecureStore.getItem(key);
    },
    setItem: (key: string, value: string) => {
        return ChunkedSecureStore.setItem(key, value);
    },
    removeItem: (key: string) => {
        return ChunkedSecureStore.removeItem(key);
    },
};

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
