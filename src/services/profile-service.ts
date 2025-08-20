import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Profile } from '@/store/profile-store';

const USERS_COLLECTION = 'users';

export async function getUserProfile(uid: string): Promise<Profile | null> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Profile;
  } else {
    console.log("No such document!");
    return null;
  }
}

export async function createUserProfile(uid: string, profileData: Partial<Profile>) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(docRef, profileData);
}


export async function saveUserProfile(uid: string, profileData: Profile) {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, {
      ...profileData
  });
}
