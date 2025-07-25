import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut, getIdTokenResult } from 'firebase/auth';
import { auth } from '../firebase';
import { type DashboardUser, type UserRole } from '../types/user';

interface AuthContextType {
  user: DashboardUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        const tokenResult = await getIdTokenResult(firebaseUser, true);
        const role = (tokenResult.claims.role as UserRole) || 'user';
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role,
          claims: tokenResult.claims,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try{
      await signInWithEmailAndPassword(auth, email, password);
    }catch(error){
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 