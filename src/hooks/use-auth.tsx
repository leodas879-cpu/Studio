
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, createUserProfile, saveUserProfile } from '@/services/profile-service';
import { useProfileStore, type Profile } from '@/store/profile-store';
import { useRecipeStore } from '@/store/recipe-store';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error: { message: string } | null }>;
  signup: (email: string, pass: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: { message: string } | null }>;
  changePassword: (newPassword: string) => Promise<{ error: { message: string } | null }>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserProfile: (profileData: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setProfile, profile } = useProfileStore();
  const { clearRecipes, loadRecipes } = useRecipeStore();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setLoading(true);
        if (user) {
            setUser(user);
            let userProfile = await getUserProfile(user.uid);
            if (!userProfile) {
                const newProfileData: Profile = {
                    id: user.uid,
                    firstName: user.displayName?.split(' ')[0] || '',
                    lastName: user.displayName?.split(' ')[1] || '',
                    email: user.email || '',
                    profilePhoto: user.photoURL || '',
                    username: user.email?.split('@')[0] || '',
                    phone: user.phoneNumber || '',
                    bio: ''
                };
                await createUserProfile(user.uid, newProfileData);
                userProfile = newProfileData;
            }
            setProfile(userProfile as Profile);
            await loadRecipes(user.uid);
        } else {
            setUser(null);
            setProfile({ id: '', username: "", email: "", firstName: "", lastName: "", phone: "", bio: "", profilePhoto: "" });
            clearRecipes();
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  };
  
  const signup = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        router.push('/dashboard');
    } catch (error) {
        console.error("Google sign-in error", error);
    }
  }

  const sendPasswordReset = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (e: any) {
        return { error: { message: e.message } };
    }
  }

  const changePassword = async (newPassword: string) => {
     if (auth.currentUser) {
        try {
            await updatePassword(auth.currentUser, newPassword);
            return { error: null };
        } catch(e: any) {
            return { error: { message: e.message } };
        }
     }
     return { error: { message: "No user is currently signed in." } };
  }

  const updateUserEmail = async (newEmail: string) => {
    if (auth.currentUser) {
        await updateEmail(auth.currentUser, newEmail);
        await saveUserProfile(auth.currentUser.uid, { ...profile, email: newEmail });
    } else {
        throw new Error("No user is currently signed in.");
    }
  }

  const updateUserProfile = async (profileData: Partial<Profile>) => {
      if (auth.currentUser) {
         await updateProfile(auth.currentUser, {
            displayName: `${profileData.firstName} ${profileData.lastName}`,
            photoURL: profileData.profilePhoto,
         });
      } else {
          throw new Error("No user is currently signed in.");
      }
  }

  const value = { user, loading, login, signup, logout, loginWithGoogle, sendPasswordReset, changePassword, updateUserEmail, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
