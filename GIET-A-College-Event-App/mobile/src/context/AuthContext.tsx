import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { fetchCurrentUser } from '../api/auth';

export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profileCompleted: boolean;
  isNewUser?: boolean;
  name?: string;
  rollNumber?: string;
  phone?: string;
  course?: string;
  branch?: string;
  year?: string;
  semester?: string;
  section?: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Bootstrap async
    const bootstrapAsync = async () => {
      const minTimer = new Promise((resolve) => setTimeout(resolve, 1800));
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          const res = await fetchCurrentUser();
          if (res.success && res.user) {
            setUser({
              id: res.user.id || res.user._id,
              email: res.user.email,
              role: res.user.role,
              profileCompleted: res.user.profileCompleted,
              name: res.user.name,
              rollNumber: res.user.rollNumber,
              phone: res.user.phone,
              course: res.user.course,
              branch: res.user.branch,
              year: res.user.year,
              semester: res.user.semester,
              section: res.user.section,
            });
          }
        }
      } catch (e) {
        // Restoring token failed
        console.log('Failed to restore token', e);
        await SecureStore.deleteItemAsync('authToken');
      } finally {
        await minTimer;
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token: string, userData: User) => {
    await SecureStore.setItemAsync('authToken', token);
    setUser(userData);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
