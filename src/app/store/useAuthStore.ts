import { create } from 'zustand';

interface AuthState {
  user: {
    id: string | number;
    username: string;
    full_name?: string;
  } | null;
  setUser: (user: AuthState['user']) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
export default useAuthStore;
