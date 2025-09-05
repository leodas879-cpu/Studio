
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, createUserProfile, saveUserProfile } from '@/services/profile-service';
import { useProfileStore, type Profile } from '@/store/profile-store';
import { useRecipeStore } from '@/store/recipe-store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  sendPasswordReset: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserProfile: (profileData: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setProfile, profile } = useProfileStore();
  const { clearRecipes } = useRecipeStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          let userProfile = await getUserProfile(user.uid);
          if (!userProfile) {
            const newProfileData: Profile = {
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
        clearRecipes();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setProfile, clearRecipes]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signup = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    const profileData: Profile = {
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
        const profileData: Profile = {
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
    } else {
        setProfile(existingProfile);
    }
    return result;
  }

  const sendPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const user = auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential);
      // Now update the password
      await updatePassword(user, newPassword);
    } else {
      throw new Error("No user is currently signed in or user has no email.");
    }
  }

  const updateUserEmail = async (newEmail: string) => {
    if (auth.currentUser) {
        await updateEmail(auth.currentUser, newEmail);
        // Also update the email in our database
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

    