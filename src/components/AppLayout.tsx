import { useState, type ReactNode } from 'react';
import { Moon, Settings, Sun, Wallet } from 'lucide-react';
import { ActionIcon, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { MemberAvatar } from '@/components/MemberAvatar';
import { notifications } from '@mantine/notifications';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { SettingsModal } from '@/components/SettingsModal';
import { NAV_ITEMS, type ScreenId } from '@/config/navigation';
import { useApp } from '@/state/appContext';
import classes from './AppLayout.module.css';

interface AppLayoutProps {
  screen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
  children: ReactNode;
}

export function AppLayout({ screen, onScreenChange, children }: AppLayoutProps) {
  const { currentUser, signOut, appearance, updateAppearance } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDark = appearance.mode === 'dark';

  return (
    <div className={classes.root}>
      <header className={classes.header}>
        <div className={classes.headerRow}>
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size={40} radius="lg" variant="light" color="terracota">
              <Wallet size={22} />
            </ThemeIcon>
            <Text fw={800} fz="lg" lh={1.2}>
              Presupuesto del hogar
            </Text>
          </Group>
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
              onClick={() => updateAppearance({ mode: isDark ? 'light' : 'dark' })
            >
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </ActionIcon>
            <ActionIcon aria-label="Ajustes" onClick={() => setSettingsOpen(true)}>
              <Settings size={22} />
            </ActionIcon>
            {currentUser && (
              <UnstyledButton
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                onClick={() => {
                  void signOut().catch(() =>
                    notifications.show({
                      color: 'red',
                      title: 'No se pudo cerrar sesión',
                      message: 'Intenta nuevamente.',
                    }),
                  );
                }}
                className={classes.userButton}
              >
                <MemberAvatar memberId={currentUser} size={40} />
              </UnstyledButton>
            )}
          </Group>
        </div>
        <div className={classes.monthRow}>
          <MonthSwitcher />
        </div>
      </header>

      <nav aria-label="Secciones" className={classes.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.id === screen;
          return (
            <button
              key={item.id}
              type="button"
              className={`${classes.navItem} ${active ? classes.navItemActive : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onScreenChange(item.id)}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <main className={classes.main}>{children}</main>

      <SettingsModal opened={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
