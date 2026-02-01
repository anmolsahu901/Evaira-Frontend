import React, { createContext, useContext, useState } from 'react';

type UserProfileContextType = {
  fullName: string | null;
  birthdate: string | null; // ISO date string: YYYY-MM-DD
  userId: number | null;
  email: string | null;
  setFullName: (name: string) => void;
  setBirthdate: (iso: string) => void;
  setUserId: (id: number | null) => void;
  setEmail: (email: string | null) => void;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [birthdate, setBirthdate] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  return (
    <UserProfileContext.Provider value={{ fullName, birthdate, userId, email, setFullName, setBirthdate, setUserId, setEmail }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
};
