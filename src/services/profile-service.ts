
'use server'

import { createClient } from "@/lib/supabase/server";
import type { Profile } from '@/store/profile-store';

export async function getUserProfile(uid: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: "object not found"
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as Profile | null;
}

export async function createUserProfile(uid: string, profileData: Partial<Profile>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: uid, ...profileData }])
        .select()
        .single();

    if (error) {
        console.error('Error creating profile:', error);
    }
    return data;
}


export async function saveUserProfile(uid: string, profileData: Profile) {
  const supabase = createClient();
  const { id, ...updateData } = profileData;
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', uid);
    
   if (error) {
     console.error('Error saving profile:', error)
   }
}
