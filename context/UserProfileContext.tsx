import React, { createContext, useContext, useState } from 'react';

type UserProfileContextType = {
  fullName: string | null;
  birthdate: string | null; // ISO date string: YYYY-MM-DD
  setFullName: (name: string) => void;
  setBirthdate: (iso: string) => void;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [birthdate, setBirthdate] = useState<string | null>(null);

  return (
    <UserProfileContext.Provider value={{ fullName, birthdate, setFullName, setBirthdate }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
};
