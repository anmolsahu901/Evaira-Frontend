import React, { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';
import { getSupabaseStorageKey } from '../config/env';
import { ChunkedSecureStore } from '../lib/secureStore';

export type UserProfile = {
  name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  faceShape: string | null;
  bodyType: string | null;
  styleVibes: string[];
  preferredOccasions: string[];
  favoriteColors: string[];
  fitTypes: string[];
  priceBucket: string | null;
  authToken: string | null;
};


type UserProfileContextType = UserProfile & {
  setName: (name: string) => void;
  setAge: (age: number) => void;
  setGender: (gender: string) => void;
  setLocation: (location: string) => void;
  setFaceShape: (shape: string) => void;
  setBodyType: (type: string) => void;
  setStyleVibes: (vibes: string[]) => void;
  setPreferredOccasions: (occasions: string[]) => void;
  setFavoriteColors: (colors: string[]) => void;
  setFitTypes: (fitTypes: string[]) => void;
  setPriceBucket: (bucket: string) => void;
  setAuthToken: (token: string | null) => void;
  resetProfile: () => void;
  getProfileData: () => UserProfile;
  logout: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setName] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [styleVibes, setStyleVibes] = useState<string[]>([]);
  const [preferredOccasions, setPreferredOccasions] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [fitTypes, setFitTypes] = useState<string[]>([]);
  const [priceBucket, setPriceBucket] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const resetProfile = () => {
    setName(null);
    setAge(null);
    setGender(null);
    setLocation(null);
    setFaceShape(null);
    setBodyType(null);
    setStyleVibes([]);
    setPreferredOccasions([]);
    setFavoriteColors([]);
    setFitTypes([]);
    setPriceBucket(null);
    setAuthToken(null);
  };

  const getProfileData = (): UserProfile => ({
    name,
    age,
    gender,
    location,
    faceShape,
    bodyType,
    styleVibes,
    preferredOccasions,
    favoriteColors,
    fitTypes,
    priceBucket,
    authToken,
  });

  const logout = async () => {
    try {
      // 1. Sign out of Supabase to revoke/clear local access/refresh tokens
      if (supabase && supabase.auth) {
        await supabase.auth.signOut().catch((e) => {
          console.warn('⚠️ Supabase signOut failed (user might be already deleted or signed out):', e.message || e);
        });
      }
      
      // 2. Explicitly clean the Supabase storage key dynamically
      const supabaseStorageKey = getSupabaseStorageKey();
      await ChunkedSecureStore.removeItem(supabaseStorageKey).catch(() => {});

      // 3. Clear backend auth token
      await SecureStore.deleteItemAsync('authToken').catch(() => {});

      // 4. Clear onboarding seen status so a new user on this device sees the guide
      await SecureStore.deleteItemAsync('hasSeenOnboarding').catch(() => {});

      // 5. Reset context state
      resetProfile();
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <UserProfileContext.Provider
      value={{
        name,
        age,
        gender,
        location,
        faceShape,
        bodyType,
        styleVibes,
        preferredOccasions,
        favoriteColors,
        fitTypes,
        priceBucket,
        authToken,
        setName,
        setAge,
        setGender,
        setLocation,
        setFaceShape,
        setBodyType,
        setStyleVibes,
        setPreferredOccasions,
        setFavoriteColors,
        setFitTypes,
        setPriceBucket,
        setAuthToken,
        resetProfile,
        getProfileData,
        logout,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
};
