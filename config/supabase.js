import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://mlvbxtjjwahtcdbtdpgd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmJ4dGpqd2FodGNkYnRkcGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODI4OTcsImV4cCI6MjA5NDg1ODg5N30.ydTxm9BqAknyebO7W5m6UTKh1G6vJ6FTk6pvXDwfYq4';

// A secure storage adapter for Supabase that works on Expo using SecureStore
const ExpoSecureStoreAdapter = {
    getItem: (key) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key, value) => {
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key) => {
        return SecureStore.deleteItemAsync(key);
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
