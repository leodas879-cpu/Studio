
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile, updateEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, createUserProfile } from '@/services/profile-service';
import { useProfileStore, type Profile } from '@/store/profile-store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserProfile: (profileData: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setProfile, profile } = useProfileStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          let userProfile = await getUserProfile(user.uid);
          if (!userProfile) {
            const newProfileData = {
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
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      } else {
        setUser(null);
        setProfile({
            username: "", email: "", firstName: "", lastName: "", phone: "", bio: "", profilePhoto: ""
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setProfile]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signup = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    const profileData = {
        email,
        firstName: '',
        lastName: '',
        username: email.split('@')[0],
        profilePhoto: '',
        phone: '',
        bio: ''
    };
    await createUserProfile(user.uid, profileData);
    setProfile(profileData);
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile already exists, if not, create one
    const existingProfile = await getUserProfile(user.uid);
    if (!existingProfile) {
        const profileData = {
            email: user.email || '',
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            username: user.email?.split('@')[0] || '',
            profilePhoto: user.photoURL || '',
            phone: user.phoneNumber || '',
            bio: ''
        };
        await createUserProfile(user.uid, profileData);
        setProfile(profileData);
    }
    return result;
  }

  const sendPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  }

  const updateUserEmail = async (email: string) => {
    if (auth.currentUser) {
        await updateEmail(auth.currentUser, email);
        // Also update the email in our database
        await getUserProfile(auth.currentUser.uid); // re-fetch to sync
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

  const value = { user, loading, login, signup, logout, loginWithGoogle, sendPasswordReset, updateUserEmail, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
