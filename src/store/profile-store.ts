import { create } from 'zustand';

interface Profile {
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
    username: "chef_master_2024",
    email: "chef@example.com",
    firstName: "Alex",
    lastName: "Johnson",
    phone: "+1 (555) 123-4567",
    bio: "Passionate home cook exploring flavors from around the world",
    profilePhoto: "https://github.com/shadcn.png"
  },
  setProfile: (profile) => set({ profile }),
}));
