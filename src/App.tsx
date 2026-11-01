import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { UserSelector } from '@/components/UserSelector';
import { HomeScreen } from '@/screens/inicio/HomeScreen';
import { ExpensesScreen } from '@/screens/gastos/ExpensesScreen';
import { ComprasScreen } from '@/screens/compras/ComprasScreen';
import { PreciosScreen } from '@/screens/precios/PreciosScreen';
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
    default: {
      const item = NAV_ITEMS.find((navItem) => navItem.id === screen);
      return item ? <PlaceholderScreen title={item.label} icon={item.icon} /> : null;
    }
  }
}

function AppContent() {
  const { currentUser } = useApp();
  const [screen, setScreen] = useState<ScreenId>('inicio');

  if (!currentUser) return <UserSelector />;

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
