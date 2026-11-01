import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button, Center, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { AppData, MemberId } from '@/types';
import { storageService } from '@/services/storageService';
import { photoService } from '@/services/photoService';
import { createEmptyData, createSampleData } from '@/data/sampleData';
import { applyFixedExpenses } from '@/utils/fixedExpenses';
import { currentMonthKey } from '@/utils/dates';
import { AppContext } from '@/state/appContext';

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [currentUser, setCurrentUser] = useState<MemberId | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const isReady = data !== null;

  useEffect(() => {
    let active = true;
    storageService
      .load()
      .then((saved) => {
        if (active) setData(saved ?? createSampleData());
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  useEffect(() => {
    if (!data) return;
    storageService.save(data).catch(() => {
      notifications.show({
        color: 'red',
        title: 'No se pudieron guardar los cambios',
        message: 'El navegador no permite guardar datos en este momento.',
      });
    });
  }, [data]);

  useEffect(() => {
    setData((previous) => (previous ? applyFixedExpenses(previous, selectedMonth) : previous));
  }, [selectedMonth, isReady]);

  const updateData = useCallback((updater: (previous: AppData) => AppData) => {
    setData((previous) => (previous ? updater(previous) : previous));
  }, []);

  const resetData = useCallback(async () => {
    await photoService.clearAll();
    await storageService.clear();
    setData(createEmptyData());
  }, []);

  if (!data) {
    if (loadFailed) {
      return (
        <Center mih="100dvh" p="lg">
          <Stack align="center" gap="md" maw={360} ta="center">
            <Text fw={700}>No pudimos cargar sus datos</Text>
            <Text>Revisa tu conexión a internet e intenta de nuevo.</Text>
            <Button
              color="terracota"
              onClick={() => {
                setLoadFailed(false);
                setLoadAttempt((attempt) => attempt + 1);
              }}
            >
              Reintentar
            </Button>
          </Stack>
        </Center>
      );
    }
    return (
      <Center mih="100dvh">
        <Loader color="terracota" />
      </Center>
    );
  }

  return (
    <AppContext.Provider
      value={{ data, updateData, currentUser, setCurrentUser, selectedMonth, setSelectedMonth, resetData }}
    >
      {children}
    </AppContext.Provider>
  );
}
