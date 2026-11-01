import { createContext, useContext } from 'react';
import type { AppData, MemberId } from '@/types';

export interface AppContextValue {
  data: AppData;
  updateData: (updater: (previous: AppData) => AppData) => void;
  currentUser: MemberId | null;
  hasSession: boolean;
  authReady: boolean;
  authError: string | null;
  loadFailed: boolean;
  isLoadingHousehold: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  retryLoad: () => void;
  selectedMonth: string;
  setSelectedMonth: (monthKey: string) => void;
  resetData: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider');
  return context;
}
