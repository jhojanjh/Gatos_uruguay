import { useState } from 'react';
import { Button, Center, Loader, Stack, Text } from '@mantine/core';
import { AppLayout } from '@/components/AppLayout';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { UserSelector } from '@/components/UserSelector';
import { HomeScreen } from '@/screens/inicio/HomeScreen';
import { ExpensesScreen } from '@/screens/gastos/ExpensesScreen';
import { ComprasScreen } from '@/screens/compras/ComprasScreen';
import { PreciosScreen } from '@/screens/precios/PreciosScreen';
import { WeekScreen } from '@/screens/semana/WeekScreen';
import { SummaryScreen } from '@/screens/resumen/SummaryScreen';
import { NAV_ITEMS, type ScreenId } from '@/config/navigation';
import { AppProvider } from '@/state/AppProvider';
import { useApp } from '@/state/appContext';

function renderScreen(screen: ScreenId) {
  switch (screen) {
    case 'inicio':
      return <HomeScreen />;
    case 'gastos':
      return <ExpensesScreen />;
    case 'compras':
      return <ComprasScreen />;
    case 'precios':
      return <PreciosScreen />;
    case 'semana':
      return <WeekScreen />;
    case 'resumen':
      return <SummaryScreen />;
    default: {
      const item = NAV_ITEMS.find((navItem) => navItem.id === screen);
      return item ? <PlaceholderScreen title={item.label} icon={item.icon} /> : null;
    }
  }
}

function AppContent() {
  const { currentUser, hasSession, authReady, authError, loadFailed, isLoadingHousehold, retryLoad } = useApp();
  const [screen, setScreen] = useState<ScreenId>('inicio');

  if (!authReady) {
    return <Center mih="100dvh"><Loader color="terracota" /></Center>;
  }

  if (!hasSession) return <UserSelector />;

  if (loadFailed) {
    return (
      <Center mih="100dvh" p="lg">
        <Stack align="center" gap="md" maw={360} ta="center">
          <Text fw={700}>No pudimos cargar los datos del hogar</Text>
          <Text>Revisa tu conexión e intenta de nuevo.</Text>
          <Button color="terracota" onClick={retryLoad}>Reintentar</Button>
        </Stack>
      </Center>
    );
  }

  if (isLoadingHousehold || !currentUser) {
    if (authError) return <UserSelector />;
    return <Center mih="100dvh"><Loader color="terracota" /></Center>;
  }

  return (
    <AppLayout screen={screen} onScreenChange={setScreen}>
      {renderScreen(screen)}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
