
'use server'

import { db } from '@/lib/firebase';
import type { Profile } from '@/store/profile-store';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 

export async function getUserProfile(uid: string): Promise<Profile | null> {
  try {
    const docRef = doc(db, "profiles", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function createUserProfile(uid: string, profileData: Partial<Profile>) {
    try {
        await setDoc(doc(db, "profiles", uid), { id: uid, ...profileData });
        const newProfile = await getDoc(doc(db, "profiles", uid));
        return newProfile.data() as Profile;
    } catch (error) {
        console.error('Error creating profile:', error);
        return null;
    }
}


export async function saveUserProfile(uid: string, profileData: Profile) {
  try {
    const profileRef = doc(db, "profiles", uid);
    await updateDoc(profileRef, { ...profileData });
  } catch (error) {
    console.error('Error saving profile:', error)
  }
}
