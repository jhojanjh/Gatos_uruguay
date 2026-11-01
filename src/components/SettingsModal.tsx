import { useState } from 'react';
import { Alert, Button, ColorSwatch, Group, Modal, Select, SegmentedControl, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Info, Trash2 } from 'lucide-react';
import { CURRENCY_OPTIONS, MEMBERS } from '@/config/constants';
import { ACCENT_COLOR_OPTIONS } from '@/theme';
import { useApp } from '@/state/appContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import { MemberAvatar } from '@/components/MemberAvatar';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const { data, updateData, currentUser, appearance, updateAppearance, resetData } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      await resetData();
      setConfirmReset(false);
      onClose();
      notifications.show({ color: 'teal', title: 'Listo', message: 'La app empieza de cero.' });
    } catch {
      notifications.show({
        color: 'red',
        title: 'No se pudo borrar',
        message: 'Intenta de nuevo en unos segundos.',
      });
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={onClose} title={<Title order={3}>Ajustes</Title>}>
        <Stack gap="lg">
          <Alert variant="light" color="salvia" icon={<Info size={20} />}>
            Los datos del hogar se sincronizan entre las dos cuentas autorizadas. Las fotos de factura quedan en el dispositivo donde se agregaron.
          </Alert>

          <Stack gap="xs">
            <Text fw={600}>Apariencia</Text>
            <SegmentedControl
              fullWidth
              value={appearance.mode}
              onChange={(value) => updateAppearance({ mode: value as 'light' | 'dark' })}
              data={[
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Oscuro' },
              ]}
            />
            <Text size="xs" c="dimmed">Esta preferencia se guarda por usuario en este dispositivo.</Text>
          </Stack>

          <Stack gap="xs">
            <Text fw={600}>Color de la aplicación</Text>
            <SimpleGrid cols={{ base: 2, xs: 4 }} spacing="xs">
              {ACCENT_COLOR_OPTIONS.map((option) => {
                const selected = appearance.accentColor === option.value;
                return (
                  <Button
                    key={option.value}
                    size="sm"
                    fullWidth
                    variant={selected ? 'filled' : 'light'}
                    color={selected ? 'terracota' : 'gray'}
                    leftSection={<ColorSwatch color={option.swatch} size={16} />}
                    aria-pressed={selected}
                    onClick={() => updateAppearance({ accentColor: option.value })}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </SimpleGrid>
          </Stack>

          <Select
            label="Moneda"
            description="Se usa en todos los montos de la app"
            data={CURRENCY_OPTIONS}
            value={data.settings.currency}
            allowDeselect={false}
            onChange={(value) => {
              if (!value) return;
              updateData((previous) => ({ ...previous, settings: { ...previous.settings, currency: value } }));
            }}
          />

          <Stack gap="xs">
            <Text fw={600}>Usuario actual</Text>
            {currentUser && (
              <Group gap="sm">
                <MemberAvatar memberId={currentUser} />
                <Text>{MEMBERS[currentUser].name}</Text>
              </Group>
            )}
          </Stack>

          <Stack gap="xs">
            <Text fw={600}>Empezar de cero</Text>
            <Text size="sm">Borra los datos compartidos del hogar. Las fotos de factura de este dispositivo también se eliminan. No se puede deshacer.</Text>
            <Button
              variant="outline"
              color="red"
              leftSection={<Trash2 size={18} />}
              onClick={() => setConfirmReset(true)}
            >
              Empezar de cero
            </Button>
          </Stack>
        </Stack>
      </Modal>

      <ConfirmModal
        opened={confirmReset}
        title="¿Empezar de cero?"
        message="Se borrarán los gastos, saldos, listas y categorías de todo el hogar. También se eliminarán las fotos guardadas en este dispositivo."
        confirmLabel={resetting ? 'Borrando...' : 'Sí, borrar todo'}
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}
