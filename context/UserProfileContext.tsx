import React, { createContext, useContext, useState } from 'react';

export type UserProfile = {
  name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  faceShape: string | null;
  bodyType: string | null;
  preferredOccasions: string[];
  favoriteColors: string[];
  authToken: string | null;
};

type UserProfileContextType = UserProfile & {
  setName: (name: string) => void;
  setAge: (age: number) => void;
  setGender: (gender: string) => void;
  setLocation: (location: string) => void;
  setFaceShape: (shape: string) => void;
  setBodyType: (type: string) => void;
  setPreferredOccasions: (occasions: string[]) => void;
  setFavoriteColors: (colors: string[]) => void;
  setAuthToken: (token: string | null) => void;
  resetProfile: () => void;
  getProfileData: () => UserProfile;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setName] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [preferredOccasions, setPreferredOccasions] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const resetProfile = () => {
    setName(null);
    setAge(null);
    setGender(null);
    setLocation(null);
    setFaceShape(null);
    setBodyType(null);
    setPreferredOccasions([]);
    setFavoriteColors([]);
    setAuthToken(null);
  };

  const getProfileData = (): UserProfile => ({
    name,
    age,
    gender,
    location,
    faceShape,
    bodyType,
    preferredOccasions,
    favoriteColors,
    authToken,
  });

  return (
    <UserProfileContext.Provider
      value={{
        name,
        age,
        gender,
        location,
        faceShape,
        bodyType,
        preferredOccasions,
        favoriteColors,
        authToken,
        setName,
        setAge,
        setGender,
        setLocation,
        setFaceShape,
        setBodyType,
        setPreferredOccasions,
        setFavoriteColors,
        setAuthToken,
        resetProfile,
        getProfileData,
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
