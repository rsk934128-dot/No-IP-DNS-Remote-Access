import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync user profile to Firestore
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'guest@noip-demo.local',
          displayName: firebaseUser.displayName || 'No-IP User',
          isAnonymous: firebaseUser.isAnonymous,
          plan: 'Free Dynamic DNS',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Could not sync user profile to Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await syncUserProfile(currentUser);
        setLoading(false);
      } else {
        // Auto-initialize anonymous guest session so database writes work seamlessly
        try {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
          await syncUserProfile(cred.user);
        } catch (anonErr) {
          console.warn('Anonymous auth failed or not enabled, setting user to null:', anonErr);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setUser(cred.user);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const message = err.message || 'Failed to sign in. Please check your credentials.';
      setError(message);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      setUser(cred.user);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const message = err.message || 'Failed to create account. Please try again.';
      setError(message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      setUser(cred.user);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const message = err.message || 'Google sign-in failed. Popup might have been closed.';
      setError(message);
      throw err;
    }
  };

  const signInAsGuest = async () => {
    setError(null);
    try {
      const cred = await signInAnonymously(auth);
      setUser(cred.user);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const message = err.message || 'Guest sign-in failed.';
      setError(message);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await fbSignOut(auth);
      // Re-initialize guest so hostnames can continue to be managed
      const cred = await signInAnonymously(auth);
      setUser(cred.user);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
