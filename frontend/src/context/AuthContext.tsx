
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, firebaseConfigured, googleProvider } from '../lib/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !firebaseConfigured) {
      toast.error('Sign-in is not configured. Add the VITE_FIREBASE_* environment variables.', {
        duration: 6000,
      });
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Failed to login. Please try again.';

      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        errorMessage = `Domain "${currentDomain}" is not authorized. Go to Firebase Console > Auth > Settings > Authorized Domains and add: ${currentDomain}`;
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelled (popup closed).';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Login popup was blocked by the browser. Please allow popups for this site.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { duration: 6000 }); // Show longer for user to read
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
