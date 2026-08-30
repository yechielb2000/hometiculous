import { create } from 'zustand';
import { UserProfile, Household } from '../types/schema';
import { AuthService } from '../services/authService';

interface AuthStore {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  logout: async () => {
    try {
      await AuthService.logout();
      set({ user: null, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));

interface HouseholdStore {
  currentHousehold: Household | null;
  activeHouseholdId: string | null;
  isAdmin: boolean;
  setCurrentHousehold: (household: Household | null) => void;
  setActiveHouseholdId: (id: string | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  updateHouseholdName: (newName: string) => void;
}

export const useHouseholdStore = create<HouseholdStore>((set) => ({
  currentHousehold: null,
  activeHouseholdId: null,
  isAdmin: false,
  setCurrentHousehold: (household) => set({ currentHousehold: household }),
  setActiveHouseholdId: (id) => set({ activeHouseholdId: id }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  updateHouseholdName: (newName) =>
    set((state) => ({
      currentHousehold: state.currentHousehold
        ? { ...state.currentHousehold, name: newName }
        : null,
    })),
}));

interface UIStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
}));
