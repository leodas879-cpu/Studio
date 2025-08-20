
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, AuthError } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase';
import { getUserProfile, createUserProfile, saveUserProfile } from '@/services/profile-service';
import { useProfileStore, type Profile } from '@/store/profile-store';
import { useRecipeStore } from '@/store/recipe-store';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  signup: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  changePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserProfile: (profileData: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setProfile, profile } = useProfileStore();
  const { clearRecipes, loadRecipes } = useRecipeStore();
  const supabase = createSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            let userProfile = await getUserProfile(user.id);
            if (!userProfile) {
                const newProfileData: Profile = {
                    id: user.id,
                    firstName: user.user_metadata.full_name?.split(' ')[0] || '',
                    lastName: user.user_metadata.full_name?.split(' ')[1] || '',
                    email: user.email || '',
                    profilePhoto: user.user_metadata.avatar_url || '',
                    username: user.email?.split('@')[0] || '',
                    phone: user.phone || '',
                    bio: ''
                };
                await createUserProfile(user.id, newProfileData);
                userProfile = newProfileData;
            }
            setProfile(userProfile as Profile);
            await loadRecipes(user.id);
        } else {
            setUser(null);
            setProfile({ id: '', username: "", email: "", firstName: "", lastName: "", phone: "", bio: "", profilePhoto: "" });
            clearRecipes();
        }
        setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setLoading(true);
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
            if (event === 'SIGNED_IN') {
                let userProfile = await getUserProfile(currentUser.id);
                 if (!userProfile) {
                    const newProfileData: Profile = {
                        id: currentUser.id,
                        firstName: currentUser.user_metadata.full_name?.split(' ')[0] || '',
                        lastName: currentUser.user_metadata.full_name?.split(' ')[1] || '',
                        email: currentUser.email || '',
                        profilePhoto: currentUser.user_metadata.avatar_url || '',
                        username: currentUser.email?.split('@')[0] || '',
                        phone: currentUser.phone || '',
                        bio: ''
                    };
                    await createUserProfile(currentUser.id, newProfileData);
                    userProfile = newProfileData;
                }
                setProfile(userProfile as Profile);
                await loadRecipes(currentUser.id);
            }
        } else {
            setProfile({ id: '', username: "", email: "", firstName: "", lastName: "", phone: "", bio: "", profilePhoto: "" });
            clearRecipes();
        }
        setLoading(false);
    });

    return () => {
        subscription.unsubscribe();
    };
}, []);


  const login = (email: string, pass: string) => {
    return supabase.auth.signInWithPassword({ email, password: pass });
  };
  
  const signup = async (email: string, pass: string) => {
    return supabase.auth.signUp({ email, password: pass });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
    });
  }

  const sendPasswordReset = (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/settings`
    });
  }

  const changePassword = async (newPassword: string) => {
     const { data, error } = await supabase.auth.updateUser({ password: newPassword });
     return { error };
  }

  const updateUserEmail = async (newEmail: string) => {
    if (user) {
        await supabase.auth.updateUser({ email: newEmail });
        await saveUserProfile(user.id, { ...profile, email: newEmail });
    } else {
        throw new Error("No user is currently signed in.");
    }
  }

  const updateUserProfile = async (profileData: Partial<Profile>) => {
      if (user) {
         await supabase.auth.updateUser({
            data: {
                full_name: `${profileData.firstName} ${profileData.lastName}`,
                avatar_url: profileData.profilePhoto
            }
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
