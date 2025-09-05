import { create } from 'zustand';

export interface Profile {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  profilePhoto: string;
}

interface ProfileStore {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: {
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    profilePhoto: ""
  },
  setProfile: (profile) => set({ profile }),
}));
