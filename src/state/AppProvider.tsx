import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { notifications } from '@mantine/notifications';
import type { AppData, MemberId, UserAppearance } from '@/types';
import { storageService } from '@/services/storageService';
import { photoService } from '@/services/photoService';
import { createEmptyData } from '@/data/sampleData';
import { applyFixedExpenses } from '@/utils/fixedExpenses';
import { currentMonthKey } from '@/utils/dates';
import { AppContext } from '@/state/appContext';
import { supabase } from '@/lib/supabase';

const DEFAULT_APPEARANCE: UserAppearance = { mode: 'light', accentColor: 'terracota' };
const APPEARANCE_KEY_PREFIX = 'hogar.apariencia.v1.';

function readAppearance(memberId: MemberId): UserAppearance {
  try {
    const raw = localStorage.getItem(APPEARANCE_KEY_PREFIX + memberId);
    if (!raw) return DEFAULT_APPEARANCE;
    const saved = JSON.parse(raw) as Partial<UserAppearance>;
    return {
      mode: saved.mode === 'dark' ? 'dark' : 'light',
      accentColor: saved.accentColor === 'azul' || saved.accentColor === 'verde' || saved.accentColor === 'violeta'
        ? saved.accentColor
        : 'terracota',
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => createEmptyData());
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<MemberId | null>(null);
  const [appearance, setAppearance] = useState<UserAppearance>(DEFAULT_APPEARANCE);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthReady(true);
      if (!nextSession) {
        setCurrentUser(null);
        setAppearance(DEFAULT_APPEARANCE);
        setIsLoadingHousehold(false);
        setLoadFailed(false);
      }
    });

    supabase.auth.getSession().then(({ data: result, error }) => {
      if (!active) return;
      if (error) setAuthError('No se pudo verificar la sesión. Vuelve a iniciar sesión.');
      setSession(result.session);
      setAuthReady(true);
    }).catch(() => {
      if (!active) return;
      setAuthError('No se pudo verificar la sesión. Vuelve a iniciar sesión.');
      setAuthReady(true);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !session) return;
    let active = true;
    setIsLoadingHousehold(true);
    setLoadFailed(false);

    void (async () => {
      try {
        const memberId = await storageService.loadMember(session.user.id);
        if (!active) return;
        if (!memberId) {
          setAuthError('Esta cuenta no está autorizada para el hogar.');
          setIsLoadingHousehold(false);
          await supabase.auth.signOut();
          return;
        }

        const saved = await storageService.load();
        if (!active) return;
        setData(saved ?? createEmptyData());
        setAppearance(readAppearance(memberId));
        setCurrentUser(memberId);
        setIsLoadingHousehold(false);
      } catch {
        if (!active) return;
        setLoadFailed(true);
        setIsLoadingHousehold(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authReady, session, loadAttempt]);

  useEffect(() => {
    if (!currentUser) return;
    storageService.save(data).catch(() => {
      notifications.show({
        color: 'red',
        title: 'No se pudieron guardar los cambios',
        message: 'Revisa tu conexión. El cambio no se sincronizó con la base de datos.',
      });
    });
  }, [data, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(APPEARANCE_KEY_PREFIX + currentUser, JSON.stringify(appearance));
    } catch {
      // La apariencia sigue aplicada durante esta sesión aunque el navegador no permita guardarla.
    }
  }, [appearance, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setData((previous) => applyFixedExpenses(previous, selectedMonth));
  }, [selectedMonth, currentUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const updateAppearance = useCallback((changes: Partial<UserAppearance>) => {
    setAppearance((previous) => ({ ...previous, ...changes }));
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);
  const retryLoad = useCallback(() => {
    setLoadFailed(false);
    setLoadAttempt((attempt) => attempt + 1);
  }, []);

  const updateData = useCallback((updater: (previous: AppData) => AppData) => {
    if (!currentUser) return;
    setData((previous) => updater(previous));
  }, [currentUser]);

  const resetData = useCallback(async () => {
    await photoService.clearAll();
    await storageService.clear();
    setData(createEmptyData());
  }, []);

  return (
    <AppContext.Provider
      value={{
        data,
        updateData,
        currentUser,
        appearance,
        updateAppearance,
        hasSession: session !== null,
        authReady,
        authError,
        loadFailed,
        isLoadingHousehold,
        signIn,
        signOut,
        clearAuthError,
        retryLoad,
        selectedMonth,
        setSelectedMonth,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
