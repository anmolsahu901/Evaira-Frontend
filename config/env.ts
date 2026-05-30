export const ENV = {
  // Supabase URL (falls back to DEV if not in .env)
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mlvbxtjjwahtcdbtdpgd.supabase.co',
  
  // Supabase Anon Key (falls back to DEV if not in .env)
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmJ4dGpqd2FodGNkYnRkcGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODI4OTcsImV4cCI6MjA5NDg1ODg5N30.ydTxm9BqAknyebO7W5m6UTKh1G6vJ6FTk6pvXDwfYq4',

  // Spring Boot API Base URL (falls back to local IP if not in .env)
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.5:8080',
};

/**
 * Dynamically extracts the Supabase project reference subdomain from the active URL.
 * Example: 'https://mlvbxtjjwahtcdbtdpgd.supabase.co' -> 'mlvbxtjjwahtcdbtdpgd'
 */
export const getSupabaseProjectRef = (): string => {
  const match = ENV.SUPABASE_URL.match(/https:\/\/([a-z0-9]+)\.supabase/);
  return match ? match[1] : 'mlvbxtjjwahtcdbtdpgd';
};

/**
 * Generates the active session storage key used by the Supabase client.
 */
export const getSupabaseStorageKey = (): string => {
  return `sb-${getSupabaseProjectRef()}-auth-token`;
};
